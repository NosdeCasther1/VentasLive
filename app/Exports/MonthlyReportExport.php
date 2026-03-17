<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class MonthlyReportExport implements FromCollection, WithHeadings, WithStyles
{
    protected $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

    public function collection()
    {
        return collect([
            ['Concepto', 'Monto'],
            ['Total Ingresos (Ventas)', 'Q ' . number_format($this->data['ingresos'], 2)],
            ['Costo de Inventario (Costo de Ventas)', 'Q ' . number_format($this->data['costos'], 2)],
            ['Utilidad Bruta', 'Q ' . number_format($this->data['utilidad'], 2)],
            ['Gastos Operativos', 'Q ' . number_format($this->data['gastos'], 2)],
            ['UTILIDAD NETA', 'Q ' . number_format($this->data['utilidad_neta'], 2)],
            ['', ''],
            ['Estadísticas Logísticas', ''],
            ['Pedidos Entregados', $this->data['logistics']['delivered']],
            ['Pedidos Fallidos/Cancelados', $this->data['logistics']['failed']],
            ['Total Gestionado', $this->data['logistics']['total']],
            ['Tasa de Éxito', $this->data['logistics']['success_rate'] . '%'],
        ]);
    }

    public function headings(): array
    {
        return [
            'REPORTE DE RENDIMIENTO MENSUAL - ' . strtoupper($this->data['mes']),
            ''
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1    => ['font' => ['bold' => true, 'size' => 14]],
            2    => ['font' => ['bold' => true]],
            7    => ['font' => ['bold' => true, 'color' => ['rgb' => '4F46E5']]], // Utilidad Neta line
            9    => ['font' => ['bold' => true]],
        ];
    }
}
