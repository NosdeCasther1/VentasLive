<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manifiesto de Motorista</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            color: #333;
            margin: 0;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
        }
        .header h1 {
            margin: 0 0 5px 0;
            font-size: 18px;
            text-transform: uppercase;
        }
        .header p {
            margin: 0;
            font-size: 12px;
            color: #666;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            border: 1px solid #ccc;
            padding: 8px;
            text-align: left;
            vertical-align: top;
        }
        th {
            background-color: #f5f5f5;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 11px;
        }
        .signature-line {
            width: 120px;
            border-bottom: 1px solid #333;
            margin-top: 20px;
            display: inline-block;
        }
        .text-right {
            text-align: right;
        }
        .text-center {
            text-align: center;
        }
        .items-list {
            margin: 5px 0 0 0;
            padding-left: 15px;
            font-size: 10px;
            color: #555;
        }
        @media print {
            body {
                padding: 0;
            }
            @page {
                margin: 1cm;
                size: landscape;
            }
        }
    </style>
</head>
<body onload="window.print()">
    <div class="header">
        <h1>Manifiesto de Motorista - VariedadesPOS</h1>
        <p>Fecha de Impresión: {{ \Carbon\Carbon::now()->format('d/m/Y H:i') }} | Total Asignaciones: {{ $deliveries->count() }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 8%">Orden #</th>
                <th style="width: 20%">Cliente y Teléfono</th>
                <th style="width: 35%">Dirección Exacta</th>
                <th style="width: 15%" class="text-right">Monto a Cobrar</th>
                <th style="width: 22%" class="text-center">Firma de Recibido</th>
            </tr>
        </thead>
        <tbody>
            @forelse($deliveries as $delivery)
            <tr>
                <td><strong>#{{ str_pad($delivery->id, 6, '0', STR_PAD_LEFT) }}</strong></td>
                <td>
                    <strong>{{ $delivery->customer_name ?: 'Sin Nombre' }}</strong><br>
                    📞 {{ $delivery->customer_phone ?: ($delivery->shipping_phone ?: 'N/A') }}
                    <ul class="items-list">
                        @foreach($delivery->details as $detail)
                            <li>{{ $detail->quantity }}x {{ $detail->productVariant->product->name ?? 'Producto' }} ({{ $detail->productVariant->size }} {{ $detail->productVariant->color }})</li>
                        @endforeach
                    </ul>
                </td>
                <td>
                    {{ $delivery->shipping_address ?: 'No especificada' }}
                </td>
                <td class="text-right">
                    @if($delivery->payment_status === 'pending_cod')
                        <strong>Q {{ number_format($delivery->total, 2) }}</strong>
                    @else
                        <span style="color: #666">Q 0.00<br>(YA PAGADO)</span>
                    @endif
                </td>
                <td class="text-center">
                    <div class="signature-line"></div>
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="5" class="text-center" style="padding: 20px;">No hay envíos en ruta actualmente.</td>
            </tr>
            @endforelse
        </tbody>
    </table>
</body>
</html>
