<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Reporte de Ventas - {{ $mes }}</title>
    <style>
        body { font-family: 'Helvetica', sans-serif; color: #334155; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #4f46e5; padding-bottom: 10px; }
        .title { color: #1e293b; font-size: 24px; font-weight: bold; margin-bottom: 5px; }
        .subtitle { color: #64748b; font-size: 14px; }
        .section-title { background: #f8fafc; padding: 8px; font-weight: bold; border-left: 4px solid #4f46e5; margin: 20px 0 10px 0; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background: #f1f5f9; text-align: left; padding: 10px; font-size: 12px; text-transform: uppercase; color: #64748b; }
        td { padding: 10px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
        .total-row { background: #eef2ff; font-weight: bold; }
        .net-profit { background: #4f46e5; color: white; font-weight: bold; font-size: 18px; }
        .text-right { text-align: right; }
        .footer { position: fixed; bottom: 0; width: 100%; text-align: center; font-size: 10px; color: #94a3b8; }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">REPORTE DE RENDIMIENTO MENSUAL</div>
        <div class="subtitle">{{ $mes }} - VentaLive 360</div>
    </div>

    <div class="section-title">Resumen Financiero</div>
    <table>
        <tr>
            <td>Total Ingresos (Ventas)</td>
            <td class="text-right">Q {{ number_format($ingresos, 2) }}</td>
        </tr>
        <tr>
            <td>Costo de Inventario (Costo de Ventas)</td>
            <td class="text-right">Q {{ number_format($costos, 2) }}</td>
        </tr>
        <tr class="total-row">
            <td>Utilidad Bruta</td>
            <td class="text-right">Q {{ number_format($utilidad, 2) }}</td>
        </tr>
        <tr>
            <td>Gastos Operativos</td>
            <td class="text-right">Q {{ number_format($gastos, 2) }}</td>
        </tr>
        <tr class="net-profit">
            <td style="color: white;">UTILIDAD NETA FINAL</td>
            <td class="text-right" style="color: white;">Q {{ number_format($utilidad_neta, 2) }}</td>
        </tr>
    </table>

    <div class="section-title">Rendimiento Logístico</div>
    <table>
        <tr>
            <td>Pedidos Entregados con Éxito</td>
            <td class="text-right">{{ $logistics['delivered'] }}</td>
        </tr>
        <tr>
            <td>Pedidos Fallidos o Cancelados</td>
            <td class="text-right">{{ $logistics['failed'] }}</td>
        </tr>
        <tr class="total-row">
            <td>Tasa de Éxito Logístico</td>
            <td class="text-right">{{ $logistics['success_rate'] }}%</td>
        </tr>
    </table>

    <div class="footer">
        Generado el {{ date('d/m/Y H:i') }} - Control de Inventario & POS VentaLive
    </div>
</body>
</html>
