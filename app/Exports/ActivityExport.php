<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ActivityExport implements FromCollection, WithHeadings, WithMapping, WithStyles, ShouldAutoSize
{
    protected $activities;
    protected $metrics;

    public function __construct($activities, $metrics = null)
    {
        $this->activities = $activities;
        $this->metrics = $metrics;
    }

    public function collection()
    {
        $rows = collect();

        if ($this->metrics) {
            $rows->push(['RESUMEN FINANCIERO - ' . strtoupper($this->metrics['mes'] ?? ''), '', '', '', '']);
            $rows->push(['Total Ingresos', '', '', number_format($this->metrics['ingresos'], 2), '']);
            $rows->push(['Costo Inventario', '', '', number_format($this->metrics['costos'], 2), '']);
            $rows->push(['Gastos Operativos', '', '', number_format($this->metrics['gastos'], 2), '']);
            $rows->push(['UTILIDAD NETA', '', '', number_format($this->metrics['utilidad_neta'], 2), '']);
            $rows->push(['', '', '', '', '']);
            $rows->push(['DETALLE DE ACTIVIDAD', '', '', '', '']);
        }

        return $rows->concat($this->activities);
    }

    public function headings(): array
    {
        return [
            'Fecha y Hora',
            'Tipo de Actividad',
            'Descripción',
            'Monto (Q)',
            'Usuario Responsable'
        ];
    }

    public function map($activity): array
    {
        // Check if it's a summary row (indexed array)
        if (isset($activity[0])) {
            return $activity;
        }

        // It's an activity record (associative array or Model)
        return [
            $activity['time'] ?? '',
            $activity['type'] ?? '',
            $activity['text'] ?? '',
            number_format($activity['total'] ?? 0, 2),
            $activity['user_name'] ?? ''
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']], 'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => '4F46E5']]],
        ];
    }
}
