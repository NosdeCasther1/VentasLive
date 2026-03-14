<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SaleDetail;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function metrics()
    {
        $currentMonth = Carbon::now()->month;
        $currentYear = Carbon::now()->year;

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

        // Count cancelled sales for the month
        $cancelledCount = \App\Models\Sale::whereMonth('created_at', $currentMonth)
            ->whereYear('created_at', $currentYear)
            ->where('status', 'cancelled')
            ->count();

        return response()->json([
            'ingresos' => $totalIngresos,
            'costos' => $totalCostos,
            'utilidad' => $utilidadBruta,
            'cancelled_count' => $cancelledCount,
            'mes' => Carbon::now()->translatedFormat('F Y'),
        ]);
    }
}
