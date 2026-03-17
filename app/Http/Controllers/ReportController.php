<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SaleDetail;
use App\Models\Sale;
use App\Models\Expense;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\ActivityExport;

class ReportController extends Controller
{
    public function metrics(Request $request)
    {
        $currentMonth = $request->query('month', Carbon::now()->month);
        $currentYear = $request->query('year', Carbon::now()->year);

        // --- FASE 1: Resumen Financiero ---
        
        // Query the sale_details table filtering by this month and COMPLETED status
        $details = SaleDetail::whereMonth('created_at', $currentMonth)
            ->whereYear('created_at', $currentYear)
            ->whereHas('sale', function($q) {
                $q->whereIn('status', ['completed', 'delivered']);
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
                $q->whereIn('status', ['completed', 'delivered']);
            })
            ->select('product_variant_id', DB::raw('SUM(quantity) as total_sold'))
            ->groupBy('product_variant_id')
            ->orderByDesc('total_sold')
            ->limit(5)
            ->with(['productVariant.product'])
            ->get()
            ->map(function($item) {
                return [
                    'name' => ($item->productVariant->product->name ?? 'P. Borrado') . ' (' . ($item->productVariant->size ?? '') . ' ' . ($item->productVariant->color ?? '') . ')',
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

        $displayDate = Carbon::createFromDate($currentYear, $currentMonth, 1)->translatedFormat('F Y');

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
            'mes' => $displayDate,
        ]);
    }

    public function exportPdf(Request $request)
    {
        try {
            $metricsResponse = $this->metrics($request);
            $metrics = json_decode($metricsResponse->getContent(), true);
            $activities = $this->getActivityHistory();

            $pdf = Pdf::loadView('reports.activity-report', [
                'metrics' => $metrics,
                'activities' => $activities,
                'mes' => $metrics['mes']
            ]);
            
            $fileName = 'Reporte_Actividad_' . now()->format('Y_m_d_H_i') . '.pdf';
            
            return $pdf->download($fileName)
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', 'attachment; filename="' . $fileName . '"');
        } catch (\Exception $e) {
            dd("Error generando PDF: " . $e->getMessage(), $e->getTraceAsString());
        }
    }

    public function exportExcel(Request $request)
    {
        try {
            $metricsResponse = $this->metrics($request);
            $metrics = json_decode($metricsResponse->getContent(), true);
            $activities = $this->getActivityHistory();

            $fileName = 'Reporte_Actividad_' . now()->format('Y_m_d_H_i') . '.xlsx';

            return Excel::download(new ActivityExport($activities, $metrics), $fileName);
        } catch (\Exception $e) {
            dd("Error generando Excel: " . $e->getMessage(), $e->getTraceAsString());
        }
    }

    private function getActivityHistory()
    {
        return Sale::with(['customer', 'cashRegister.user'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($sale) {
                $isDraft = $sale->status === 'live_draft';
                $color = $isDraft ? 'indigo' : 'emerald';
                $type = $isDraft ? 'Bolsa Apartada' : 'Venta Completada';
                $identifier = $sale->customer_name ?: ($sale->social_handle ? '@'.$sale->social_handle : 'Cliente General');
                $text = $isDraft 
                    ? "Nueva bolsa para $identifier" 
                    : "Venta completada: $identifier";
                
                $userName = $sale->cashRegister && $sale->cashRegister->user 
                    ? $sale->cashRegister->user->name 
                    : 'System/Admin';

                return [
                    'time' => $sale->created_at->format('d/m/Y H:i'),
                    'type' => $type,
                    'text' => $text,
                    'total' => $sale->total,
                    'user_name' => $userName,
                    'color' => $color
                ];
            });
    }

    public function liveSummary(Request $request)
    {
        $date = $request->query('date', Carbon::today()->format('Y-m-d'));
        $startOfDay = Carbon::parse($date)->startOfDay();
        $endOfDay = Carbon::parse($date)->endOfDay();

        // Total_Apartado: Sum of ALL bags created today (live_draft + completed)
        $totalApartado = Sale::whereBetween('created_at', [$startOfDay, $endOfDay])
            ->whereIn('status', ['live_draft', 'completed'])
            ->sum('total');

        // Total_Confirmado: Sum of bags that are completed (sent to logistics)
        $totalConfirmado = Sale::whereBetween('created_at', [$startOfDay, $endOfDay])
            ->where('status', 'completed')
            ->where('shipping_status', '!=', 'cancelled')
            ->sum('total');

        // Total_Bolsas_Huerfanas: Count of bags still in live_draft
        $totalHuerfanas = Sale::whereBetween('created_at', [$startOfDay, $endOfDay])
            ->where('status', 'live_draft')
            ->count();

        // Top_Clientes: Top 5 by amount spent today
        $topCustomers = Sale::whereBetween('created_at', [$startOfDay, $endOfDay])
            ->whereIn('status', ['live_draft', 'completed'])
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

        return response()->json([
            'date' => $date,
            'total_apartado' => $totalApartado,
            'total_confirmado' => $totalConfirmado,
            'total_huerfanas' => $totalHuerfanas,
            'top_customers' => $topCustomers,
        ]);
    }

    public function liveSummaryPdf(Request $request)
    {
        $date = $request->query('date', Carbon::today()->format('Y-m-d'));
        $metricsResponse = $this->liveSummary($request);
        $metrics = json_decode($metricsResponse->getContent(), true);

        $pdf = Pdf::loadView('reports.live-summary', [
            'metrics' => $metrics,
            'date' => Carbon::parse($date)->translatedFormat('d F Y')
        ]);
        
        // Define paper size for thermal printer (80mm width, dynamic height)
        $pdf->setPaper([0, 0, 226.77, 500], 'portrait'); 

        $fileName = 'Resumen_Live_' . $date . '.pdf';
        
        return $pdf->download($fileName)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'attachment; filename="' . $fileName . '"');
    }
}
