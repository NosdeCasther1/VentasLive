<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Historial de Actividad - VentaLive 360</title>
    <style>
        body { font-family: 'Helvetica', sans-serif; color: #334155; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #4f46e5; padding-bottom: 10px; }
        .title { color: #1e293b; font-size: 20px; font-weight: bold; margin-bottom: 5px; }
        .subtitle { color: #64748b; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { background: #f1f5f9; text-align: left; padding: 8px; font-size: 10px; text-transform: uppercase; color: #64748b; border-bottom: 1px solid #cbd5e1; }
        td { padding: 8px; border-bottom: 1px solid #f1f5f9; font-size: 11px; }
        .amount { font-weight: bold; text-align: right; }
        .type-badge { font-size: 9px; font-weight: bold; text-transform: uppercase; padding: 2px 5px; border-radius: 4px; }
        .badge-indigo { background: #e0e7ff; color: #4338ca; }
        .badge-emerald { background: #d1fae5; color: #065f46; }
        .footer { position: fixed; bottom: 0; width: 100%; text-align: center; font-size: 9px; color: #94a3b8; }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">REPORTE INTEGRAL DE RENDIMIENTO</div>
        <div class="subtitle">Mes: {{ $mes }} | Generado el {{ date('d/m/Y H:i') }} - VentaLive 360</div>
    </div>

    <div style="margin-bottom: 25px;">
        <h3 style="font-size: 14px; text-transform: uppercase; color: #4f46e5; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">Resumen Financiero</h3>
        <table style="width: 50%;">
            <tr>
                <td style="font-weight: bold; border: none;">Ingresos Totales:</td>
                <td style="text-align: right; border: none;">Q {{ number_format($metrics['ingresos'], 2) }}</td>
            </tr>
            <tr>
                <td style="font-weight: bold; border: none;">Gastos Operativos:</td>
                <td style="text-align: right; border: none; color: #e11d48;">- Q {{ number_format($metrics['gastos'], 2) }}</td>
            </tr>
            <tr style="background-color: #f8fafc;">
                <td style="font-weight: bold; border: none; color: #4f46e5;">UTILIDAD NETA:</td>
                <td style="text-align: right; border: none; font-weight: 900; color: #4f46e5;">Q {{ number_format($metrics['utilidad_neta'], 2) }}</td>
            </tr>
        </table>
    </div>

    <h3 style="font-size: 14px; text-transform: uppercase; color: #4f46e5; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">Detalle de Movimientos</h3>
    <table>
        <thead>
            <tr>
                <th width="15%">Fecha</th>
                <th width="20%">Tipo</th>
                <th width="35%">Descripción</th>
                <th width="15%">Usuario</th>
                <th width="15%" style="text-align: right;">Monto</th>
            </tr>
        </thead>
        <tbody>
            @foreach($activities as $activity)
            <tr>
                <td>{{ $activity['time'] }}</td>
                <td>
                    <span class="type-badge {{ $activity['color'] == 'indigo' ? 'badge-indigo' : 'badge-emerald' }}">
                        {{ $activity['type'] }}
                    </span>
                </td>
                <td>{{ $activity['text'] }}</td>
                <td>{{ $activity['user_name'] }}</td>
                <td class="amount">Q {{ number_format($activity['total'], 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        © {{ date('Y') }} VentaLive 360 - Página 1
    </div>
</body>
</html>
