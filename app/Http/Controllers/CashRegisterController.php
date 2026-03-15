<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\CashRegister;
use App\Models\Sale;
use App\Models\Expense;

use Inertia\Inertia;
use Carbon\Carbon;

class CashRegisterController extends Controller
{
    public function index()
    {
        $openRegister = CashRegister::where('user_id', auth()->id())
            ->where('status', 'open')
            ->first();

        if (!$openRegister) {
            return Inertia::render('CashRegister/Open');
        }

        return Inertia::render('CashRegister/Close');
    }

    public function store(Request $request)
    {
        $request->validate([
            'opening_amount' => 'required|numeric|min:0',
        ]);

        CashRegister::create([
            'user_id' => auth()->id(),
            'opened_at' => now(),
            'opening_amount' => $request->opening_amount,
            'status' => 'open',
        ]);

        return redirect()->route('products.index')->with('success', 'Caja abierta correctamente.');
    }

    public function summary()
    {
        $register = CashRegister::where('user_id', auth()->id())
            ->where('status', 'open')
            ->firstOrFail();

        // Calculate summary
        // Cash sales: local POS sales paid in cash
        $cashSales = Sale::where('cash_register_id', $register->id)
            ->whereIn('sale_type', ['local', 'pos', 'shipping'])
            ->where('payment_method', 'cash')
            ->sum('total');

        // Delivery sales: Deliveries (COD) collected by motoristas
        $deliverySales = Sale::where('cash_register_id', $register->id)
            ->whereIn('sale_type', ['delivery', 'manual_delivery'])
            ->sum('total');

        // Expenses: paid in cash
        $cashExpenses = Expense::where('cash_register_id', $register->id)
            ->sum('amount');

        $expectedAmount = $register->opening_amount + $cashSales + $deliverySales - $cashExpenses;

        return response()->json([
            'id' => $register->id,
            'opening_amount' => $register->opening_amount,
            'opened_at' => $register->opened_at,
            'cash_sales' => $cashSales,
            'delivery_sales' => $deliverySales,
            'cash_expenses' => $cashExpenses,
            'expected_amount' => $expectedAmount,
        ]);
    }

    public function close(Request $request)
    {
        $request->validate([
            'actual_amount' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $register = CashRegister::where('user_id', auth()->id())
            ->where('status', 'open')
            ->firstOrFail();

        // Recalculate summary to save final values
        $cashSales = Sale::where('cash_register_id', $register->id)
            ->whereIn('sale_type', ['local', 'pos', 'shipping'])
            ->where('payment_method', 'cash')
            ->sum('total');

        $deliverySales = Sale::where('cash_register_id', $register->id)
            ->whereIn('sale_type', ['delivery', 'manual_delivery'])
            ->sum('total');

        $cashExpenses = Expense::where('cash_register_id', $register->id)
            ->sum('amount');

        $expectedAmount = $register->opening_amount + $cashSales + $deliverySales - $cashExpenses;
        $actualAmount = $request->actual_amount;
        $difference = $actualAmount - $expectedAmount;

        $register->update([
            'closed_at' => now(),
            'cash_sales' => $cashSales,
            'delivery_sales' => $deliverySales,
            'cash_expenses' => $cashExpenses,
            'expected_amount' => $expectedAmount,
            'actual_amount' => $actualAmount,
            'difference' => $difference,
            'notes' => $request->notes,
            'status' => 'closed',
        ]);

        return redirect()->route('cash-register.print', $register->id)->with('success', 'Caja cerrada correctamente.');
    }

    public function printTicket($id)
    {
        $register = CashRegister::with(['user', 'sales', 'expenses'])
            ->findOrFail($id);

        return Inertia::render('CashRegister/Report', [
            'register' => $register
        ]);
    }
}
