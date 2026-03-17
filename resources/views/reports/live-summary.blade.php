<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Resumen de Live - VentaLive 360</title>
    <style>
        @page { margin: 0; }
        body { 
            font-family: 'Courier', 'Monaco', monospace; 
            color: #000; 
            font-size: 12px; 
            padding: 10px;
            width: 80mm;
            line-height: 1.2;
        }
        .header { text-align: center; margin-bottom: 10px; }
        .title { font-size: 16px; font-weight: bold; border-bottom: 2px solid #000; padding-bottom: 5px; margin-bottom: 5px; }
        .subtitle { font-size: 10px; margin-bottom: 10px; }
        .divider { border-top: 1px dashed #000; margin: 10px 0; }
        .metric { display: flex; justify-content: space-between; margin-bottom: 5px; }
        .metric-label { font-weight: bold; }
        .metric-value { font-weight: bold; }
        .section-title { font-weight: bold; text-decoration: underline; margin-bottom: 5px; text-transform: uppercase; }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; font-size: 10px; border-bottom: 1px solid #000; padding: 3px 0; }
        td { padding: 3px 0; font-size: 10px; }
        .text-right { text-align: right; }
        .footer { text-align: center; font-size: 9px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">VARIEDADES NOSDE</div>
        <div class="subtitle">RESUMEN DE LIVE - {{ $date }}</div>
    </div>

    <div class="divider"></div>

    <div class="metric">
        <span class="metric-label">TOTAL APARTADO:</span>
        <span class="metric-value">Q {{ number_format($metrics['total_apartado'], 2) }}</span>
    </div>
    <div class="metric">
        <span class="metric-label">CONFIRMADO (CONF):</span>
        <span class="metric-value">Q {{ number_format($metrics['total_confirmado'], 2) }}</span>
    </div>
    <div class="metric">
        <span class="metric-label">BOLSAS HUERFANAS:</span>
        <span class="metric-value">{{ $metrics['total_huerfanas'] }}</span>
    </div>

    <div class="divider"></div>

    <div class="section-title">TOP 5 CLIENTES</div>
    <table>
        <thead>
            <tr>
                <th>CLIENTE</th>
                <th class="text-right">MONTO</th>
            </tr>
        </thead>
        <tbody>
            @foreach($metrics['top_customers'] as $customer)
            <tr>
                <td>{{ substr($customer['name'], 0, 18) }}</td>
                <td class="text-right">Q {{ number_format($customer['total'], 2) }}</td>
            </tr>
            @endforeach
            @if(count($metrics['top_customers']) == 0)
            <tr>
                <td colspan="2" style="text-align: center; font-style: italic;">Sin records hoy</td>
            </tr>
            @endif
        </tbody>
    </table>

    <div class="divider"></div>

    <div class="footer">
        GENERADO POR VENTALIVE 360<br>
        {{ date('d/m/Y H:i') }}<br>
        *** FIN DEL REPORTE ***
    </div>
</body>
</html>
