<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Reporte Contable</title>
    <style>
        body { font-family: 'Helvetica', sans-serif; font-size: 10pt; color: #333; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { font-size: 18pt; margin: 0; text-transform: uppercase; }
        .header h2 { font-size: 14pt; margin: 5px 0; color: #666; }
        .info { margin-bottom: 20px; font-size: 10pt; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background-color: #f2f2f2; border: 1px solid #ccc; padding: 8px; text-align: left; }
        td { border: 1px solid #ccc; padding: 8px; vertical-align: top; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .footer { position: fixed; bottom: 0; width: 100%; text-align: center; font-size: 8pt; color: #999; }
        .summary-box { border: 2px solid #333; padding: 15px; background-color: #f9f9f9; }
        .tab-title { font-size: 14pt; font-weight: bold; border-bottom: 2px solid #333; margin-top: 30px; margin-bottom: 10px; }
        .total-row { font-weight: bold; background-color: #eee; }
    </style>
</head>
<body>
    <div class="header">
        <h1>NosdeCasther</h1>
        <h2>{{ $title }}</h2>
        <div class="info">
            Periodo: {{ $startDate }} al {{ $endDate }}
        </div>
    </div>

    @if($type == 'diario')
        <table style="font-size: 9pt;">
            <thead>
                <tr>
                    <th width="15%">Fecha</th>
                    <th width="35%">Concepto</th>
                    <th width="20%">Cuenta</th>
                    <th width="15%" class="text-right">Debe</th>
                    <th width="15%" class="text-right">Haber</th>
                </tr>
            </thead>
            <tbody>
                @php $totalDebe = 0; $totalHaber = 0; @endphp
                @foreach($data as $entry)
                    <tr>
                        <td>{{ $entry['date'] }}</td>
                        <td>{{ $entry['concept'] }}</td>
                        <td>{{ $entry['account'] }}</td>
                        <td class="text-right">{{ number_format($entry['debit'], 2) }}</td>
                        <td class="text-right">{{ number_format($entry['credit'], 2) }}</td>
                    </tr>
                    @php $totalDebe += $entry['debit']; $totalHaber += $entry['credit']; @endphp
                @endforeach
            </tbody>
            <tfoot>
                <tr class="total-row">
                    <td colspan="3" class="text-right">TOTALES:</td>
                    <td class="text-right">{{ number_format($totalDebe, 2) }}</td>
                    <td class="text-right">{{ number_format($totalHaber, 2) }}</td>
                </tr>
            </tfoot>
        </table>
    @elseif($type == 'mayor')
        @foreach($data as $account)
            <div class="tab-title">{{ $account['account'] }}</div>
            <table>
                <thead>
                    <tr>
                        <th width="20%">Saldo Inicial</th>
                        <th width="25%">Total Cargos (Debe)</th>
                        <th width="25%">Total Abonos (Haber)</th>
                        <th width="30%">Saldo Final</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="text-right">{{ number_format($account['initial_balance'], 2) }}</td>
                        <td class="text-right">{{ number_format($account['total_debits'], 2) }}</td>
                        <td class="text-right">{{ number_format($account['total_credits'], 2) }}</td>
                        <td class="text-right" style="font-weight: bold;">{{ number_format($account['final_balance'], 2) }}</td>
                    </tr>
                </tbody>
            </table>
        @endforeach
    @elseif($type == 'resultados')
        <div class="summary-box">
            <h3 class="text-center">ESTADO DE RESULTADOS</h3>
            <table style="border: none;">
                <tr style="border: none;">
                    <td style="border: none; font-size: 12pt;">(+) Ingresos por Ventas</td>
                    <td style="border: none; font-size: 12pt;" class="text-right">{{ number_format($data['ventas'], 2) }}</td>
                </tr>
                <tr style="border: none;">
                    <td style="border: none; font-size: 12pt;">(-) Costo de Ventas</td>
                    <td style="border: none; font-size: 12pt;" class="text-right">{{ number_format($data['costo_ventas'], 2) }}</td>
                </tr>
                <tr style="border: none; font-weight: bold; border-top: 1px solid #333;">
                    <td style="border: none; font-size: 12pt;">(=) UTILIDAD BRUTA</td>
                    <td style="border: none; font-size: 12pt;" class="text-right">{{ number_format($data['utilidad_bruta'], 2) }}</td>
                </tr>
                <tr style="border: none; height: 20px;">
                    <td colspan="2" style="border: none;"></td>
                </tr>
                <tr style="border: none;">
                    <td style="border: none; font-size: 12pt;">(-) Gastos Operativos</td>
                    <td style="border: none; font-size: 12pt;" class="text-right">{{ number_format($data['gastos_operativos'], 2) }}</td>
                </tr>
                <tr style="border: none; font-weight: bold; border-top: 2px solid #333; background-color: #eee;">
                    <td style="border: none; font-size: 14pt;">(=) UTILIDAD NETA DEL EJERCICIO</td>
                    <td style="border: none; font-size: 14pt;" class="text-right">{{ number_format($data['utilidad_neta'], 2) }}</td>
                </tr>
            </table>
        </div>
    @endif

    <div class="footer">
        Reporte generado el {{ date('d/m/Y H:i') }} - NosdeCasther
    </div>
</body>
</html>
