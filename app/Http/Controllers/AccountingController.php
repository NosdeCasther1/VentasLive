<?php

namespace App\Http\Controllers;

use App\Services\AccountingService;
use App\Exports\AccountingExport;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;

class AccountingController extends Controller
{
    protected $accountingService;

    public function __construct(AccountingService $accountingService)
    {
        $this->accountingService = $accountingService;
    }

    public function index()
    {
        return Inertia::render('Reports/AccountingReports');
    }

    public function getDiario(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date',
        ]);

        $entries = $this->accountingService->getLibroDiario(
            $request->start_date,
            $request->end_date
        );

        return response()->json($entries);
    }

    public function getMayor(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date',
        ]);

        $ledger = $this->accountingService->getLibroMayor(
            $request->start_date,
            $request->end_date
        );

        return response()->json($ledger);
    }

    public function getEstadoResultados(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date',
        ]);

        $report = $this->accountingService->getEstadoResultados(
            $request->start_date,
            $request->end_date
        );

        return response()->json($report);
    }

    public function exportPdf(Request $request)
    {
        $request->validate([
            'type' => 'required|in:diario,mayor,resultados',
            'start_date' => 'required|date',
            'end_date' => 'required|date',
        ]);

        $title = "Reporte Contable - " . ucfirst($request->type);
        $data = null;

        if ($request->type == 'diario') {
            $data = $this->accountingService->getLibroDiario($request->start_date, $request->end_date);
        } elseif ($request->type == 'mayor') {
            $data = $this->accountingService->getLibroMayor($request->start_date, $request->end_date);
        } else {
            $data = $this->accountingService->getEstadoResultados($request->start_date, $request->end_date);
        }

        $pdf = Pdf::loadView('reports.accounting', [
            'type' => $request->type,
            'data' => $data,
            'startDate' => $request->start_date,
            'endDate' => $request->end_date,
            'title' => $title
        ]);

        return $pdf->download("Reporte_Contable_{$request->type}_{$request->start_date}.pdf");
    }

    public function exportExcel(Request $request)
    {
        $request->validate([
            'type' => 'required|in:diario,mayor',
            'start_date' => 'required|date',
            'end_date' => 'required|date',
        ]);

        $data = null;
        if ($request->type == 'diario') {
            $data = $this->accountingService->getLibroDiario($request->start_date, $request->end_date);
        } else {
            $data = $this->accountingService->getLibroMayor($request->start_date, $request->end_date);
        }

        $fileName = "Reporte_Contable_{$request->type}_{$request->start_date}.xlsx";

        return Excel::download(
            new AccountingExport($data, $request->type),
            $fileName
        );
    }
}
