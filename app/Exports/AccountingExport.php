<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class AccountingExport implements FromCollection, WithHeadings, WithMapping
{
    protected $data;
    protected $type;

    public function __construct($data, $type)
    {
        $this->data = $data;
        $this->type = $type;
    }

    public function collection()
    {
        return collect($this->data);
    }

    public function headings(): array
    {
        if ($this->type == 'diario') {
            return ['Fecha', 'Concepto', 'Cuenta', 'Debe', 'Haber'];
        } elseif ($this->type == 'mayor') {
            return ['Cuenta', 'Saldo Inicial', 'Cargos (Debe)', 'Abonos (Haber)', 'Saldo Final'];
        }
        return [];
    }

    public function map($row): array
    {
        if ($this->type == 'diario') {
            return [
                $row['date'],
                $row['concept'],
                $row['account'],
                $row['debit'],
                $row['credit'],
            ];
        } elseif ($this->type == 'mayor') {
            return [
                $row['account'],
                $row['initial_balance'],
                $row['total_debits'],
                $row['total_credits'],
                $row['final_balance'],
            ];
        }
        return [];
    }
}
