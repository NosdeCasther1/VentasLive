<?php

namespace App\Services;

use App\Models\Sale;
use App\Models\PurchaseEntry;
use App\Models\Expense;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class AccountingService
{
    /**
     * Get Chronological Ledger (Libro Diario) within a date range.
     */
    public function getLibroDiario($startDate, $endDate)
    {
        $sales = Sale::with('details')
            ->where('status', 'completed')
            ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
            ->get();

        $purchases = PurchaseEntry::with('details')
            ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
            ->get();

        $expenses = Expense::whereBetween('expense_date', [$startDate, $endDate])
            ->get();

        $entries = collect();

        // Process Sales
        foreach ($sales as $sale) {
            $total = $sale->total;
            $cogs = $sale->details->sum(function ($detail) {
                return $detail->quantity * $detail->historical_cost;
            });

            // Entry 1: Income
            $entries->push([
                'date' => $sale->created_at->format('Y-m-d'),
                'concept' => "Venta #ORD-" . str_pad($sale->id, 4, '0', STR_PAD_LEFT),
                'account' => 'Caja/Bancos',
                'debit' => $total,
                'credit' => 0
            ]);
            $entries->push([
                'date' => $sale->created_at->format('Y-m-d'),
                'concept' => "Venta #ORD-" . str_pad($sale->id, 4, '0', STR_PAD_LEFT),
                'account' => 'Ingresos por Ventas',
                'debit' => 0,
                'credit' => $total
            ]);

            // Entry 2: Cost of Goods Sold
            if ($cogs > 0) {
                $entries->push([
                    'date' => $sale->created_at->format('Y-m-d'),
                    'concept' => "Costo de Venta #ORD-" . str_pad($sale->id, 4, '0', STR_PAD_LEFT),
                    'account' => 'Costo de Ventas',
                    'debit' => $cogs,
                    'credit' => 0
                ]);
                $entries->push([
                    'date' => $sale->created_at->format('Y-m-d'),
                    'concept' => "Costo de Venta #ORD-" . str_pad($sale->id, 4, '0', STR_PAD_LEFT),
                    'account' => 'Inventario',
                    'debit' => 0,
                    'credit' => $cogs
                ]);
            }
        }

        // Process Purchases
        foreach ($purchases as $purchase) {
            $total = $purchase->details->sum(function ($detail) {
                return $detail->quantity * $detail->unit_cost;
            });

            if ($total > 0) {
                $entries->push([
                    'date' => $purchase->created_at->format('Y-m-d'),
                    'concept' => "Compra de Inventario #" . ($purchase->invoice_number ?? $purchase->id),
                    'account' => 'Inventario',
                    'debit' => $total,
                    'credit' => 0
                ]);
                $entries->push([
                    'date' => $purchase->created_at->format('Y-m-d'),
                    'concept' => "Compra de Inventario #" . ($purchase->invoice_number ?? $purchase->id),
                    'account' => 'Caja/Bancos',
                    'debit' => 0,
                    'credit' => $total
                ]);
            }
        }

        // Process Expenses
        foreach ($expenses as $expense) {
            $date = Carbon::parse($expense->expense_date)->format('Y-m-d');
            $entries->push([
                'date' => $date,
                'concept' => "Gasto: " . $expense->description,
                'account' => 'Gastos Operativos',
                'debit' => $expense->amount,
                'credit' => 0
            ]);
            $entries->push([
                'date' => $date,
                'concept' => "Gasto: " . $expense->description,
                'account' => 'Caja/Bancos',
                'debit' => 0,
                'credit' => $expense->amount
            ]);
        }

        return $entries->sortBy('date')->values();
    }

    /**
     * Get General Ledger (Libro Mayor) within a date range.
     */
    public function getLibroMayor($startDate, $endDate)
    {
        $allAccounts = ['Caja/Bancos', 'Inventario', 'Ingresos por Ventas', 'Costo de Ventas', 'Gastos Operativos'];
        $ledger = [];

        // 1. Get Initial Balances using optimized aggregation queries
        $initialBalances = $this->calculateInitialBalances($startDate);

        // 2. Get Range Entries
        $rangeEntries = $this->getLibroDiario($startDate, $endDate);

        foreach ($allAccounts as $acc) {
            $accEntries = $rangeEntries->where('account', $acc);
            $totalDebits = $accEntries->sum('debit');
            $totalCredits = $accEntries->sum('credit');
            
            $initial = $initialBalances[$acc];
            
            if (in_array($acc, ['Caja/Bancos', 'Inventario', 'Costo de Ventas', 'Gastos Operativos'])) {
                $final = $initial + $totalDebits - $totalCredits;
            } else { // Ingresos por Ventas
                $final = $initial + $totalCredits - $totalDebits;
            }

            $ledger[] = [
                'account' => $acc,
                'initial_balance' => $initial,
                'total_debits' => $totalDebits,
                'total_credits' => $totalCredits,
                'final_balance' => $final,
                'entries' => $accEntries->values()
            ];
        }

        return $ledger;
    }

    /**
     * Get Income Statement (Estado de Resultados)
     */
    public function getEstadoResultados($startDate, $endDate)
    {
        $mayor = $this->getLibroMayor($startDate, $endDate);
        
        $ventas = collect($mayor)->firstWhere('account', 'Ingresos por Ventas')['total_credits'] ?? 0;
        $costos = collect($mayor)->firstWhere('account', 'Costo de Ventas')['total_debits'] ?? 0;
        $gastos = collect($mayor)->firstWhere('account', 'Gastos Operativos')['total_debits'] ?? 0;

        $utilidadBruta = $ventas - $costos;
        $utilidadNeta = $utilidadBruta - $gastos;

        return [
            'ventas' => $ventas,
            'costo_ventas' => $costos,
            'utilidad_bruta' => $utilidadBruta,
            'gastos_operativos' => $gastos,
            'utilidad_neta' => $utilidadNeta
        ];
    }

    /**
     * Calculate initial balances before a given date using optimized queries.
     */
    protected function calculateInitialBalances($startDate)
    {
        $startDateCarbon = Carbon::parse($startDate);
        
        // 1. Total Sales (Income & Cash)
        $salesTotal = Sale::where('status', 'completed')
            ->where('created_at', '<', $startDateCarbon->startOfDay())
            ->sum('total');

        // 2. Total COGS (Cost & Inventory removal)
        $cogsTotal = \App\Models\SaleDetail::whereHas('sale', function($q) use ($startDateCarbon) {
            $q->where('status', 'completed')
              ->where('created_at', '<', $startDateCarbon->startOfDay());
        })->sum(DB::raw('quantity * historical_cost'));

        // 3. Total Purchases (Inventory addition & Cash removal)
        $purchasesTotal = \App\Models\PurchaseEntryDetail::whereHas('purchaseEntry', function($q) use ($startDateCarbon) {
            $q->where('created_at', '<', $startDateCarbon->startOfDay());
        })->sum(DB::raw('quantity * unit_cost'));

        // 4. Total Expenses (Expenses & Cash removal)
        $expensesTotal = Expense::where('expense_date', '<', $startDateCarbon->format('Y-m-d'))
            ->sum('amount');

        // Build account map
        // Assets: Saldo = Cargos - Abonos
        // Resultados (Ingresos): Saldo = Abonos - Cargos
        
        return [
            'Caja/Bancos' => $salesTotal - $purchasesTotal - $expensesTotal,
            'Inventario' => $purchasesTotal - $cogsTotal,
            'Ingresos por Ventas' => $salesTotal,
            'Costo de Ventas' => $cogsTotal,
            'Gastos Operativos' => $expensesTotal,
        ];
    }
}
