<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SaleDetail;
use App\Models\Sale;
use App\Models\Expense;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function metrics()
    {
        $currentMonth = Carbon::now()->month;
        $currentYear = Carbon::now()->year;

        // --- FASE 1: Resumen Financiero ---
        
        // Query the sale_details table filtering by this month and COMPLETED status
        $details = SaleDetail::whereMonth('created_at', $currentMonth)
            ->whereYear('created_at', $currentYear)
            ->whereHas('sale', function($q) {
                $q->where('status', 'completed');
            })
            ->get();

        $totalIngresos = 0;
        $totalCostos = 0;

        foreach ($details as $detail) {
            $totalIngresos += ($detail->quantity * $detail->selling_price);
            $totalCostos += ($detail->quantity * $detail->historical_cost);
        }

        $utilidadBruta = $totalIngresos - $totalCostos;

        // Sumar gastos del mes
        $totalGastos = Expense::whereMonth('expense_date', $currentMonth)
            ->whereYear('expense_date', $currentYear)
            ->sum('amount');

        $utilidadNeta = $utilidadBruta - $totalGastos;

        // --- FASE 2: Top Productos y Clientes ---

        // Top 5 Productos
        $topProducts = SaleDetail::whereMonth('created_at', $currentMonth)
            ->whereYear('created_at', $currentYear)
            ->whereHas('sale', function($q) {
                $q->where('status', 'completed');
            })
            ->select('product_variant_id', DB::raw('SUM(quantity) as total_sold'))
            ->groupBy('product_variant_id')
            ->orderByDesc('total_sold')
            ->limit(5)
            ->with(['productVariant.product'])
            ->get()
            ->map(function($item) {
                return [
                    'name' => $item->productVariant->product->name . ' (' . ($item->productVariant->size ?? '') . ' ' . ($item->productVariant->color ?? '') . ')',
                    'quantity' => $item->total_sold
                ];
            });

        // Top 5 Clientes
        $topCustomers = Sale::whereMonth('created_at', $currentMonth)
            ->whereYear('created_at', $currentYear)
            ->whereIn('status', ['completed', 'delivered'])
            ->select('customer_id', 'social_handle', 'customer_name', DB::raw('SUM(total) as total_spent'))
            ->groupBy('customer_id', 'social_handle', 'customer_name')
            ->orderByDesc('total_spent')
            ->limit(5)
            ->get()
            ->map(function($item) {
                return [
                    'name' => $item->social_handle ?: ($item->customer_name ?: 'Cliente Genérico'),
                    'total' => $item->total_spent
                ];
            });

        // --- FASE 3: Rendimiento Logístico ---

        $logisticsStats = Sale::whereMonth('created_at', $currentMonth)
            ->whereYear('created_at', $currentYear)
            ->whereNotNull('shipping_status')
            ->select('shipping_status', DB::raw('count(*) as count'))
            ->groupBy('shipping_status')
            ->get()
            ->pluck('count', 'shipping_status');

        $delivered = $logisticsStats->get('delivered', 0);
        $failed = $logisticsStats->get('returned', 0) + $logisticsStats->get('cancelled', 0);
        $totalLogistics = $logisticsStats->sum();

        $successRate = $totalLogistics > 0 ? round(($delivered / $totalLogistics) * 100, 1) : 100;

        return response()->json([
            'ingresos' => $totalIngresos,
            'costos' => $totalCostos,
            'gastos' => $totalGastos,
            'utilidad' => $utilidadBruta,
            'utilidad_neta' => $utilidadNeta,
            'top_products' => $topProducts,
            'top_customers' => $topCustomers,
            'logistics' => [
                'delivered' => $delivered,
                'failed' => $failed,
                'total' => $totalLogistics,
                'success_rate' => $successRate
            ],
            'mes' => Carbon::now()->translatedFormat('F Y'),
        ]);
    }
}
