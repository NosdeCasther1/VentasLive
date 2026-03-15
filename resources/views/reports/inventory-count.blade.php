<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Toma Física de Inventario</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        th { background: #f2f2f2; }
        .header { text-align: center; margin-bottom: 30px; }
        .date { float: right; }
        .empty-col { width: 80px; }
    </style>
</head>
<body>
    <div class="header">
        <h2>Toma Física de Inventario</h2>
        <div class="date">Fecha: {{ date('d/m/Y H:i') }}</div>
    </div>

    <table>
        <thead>
            <tr>
                <th>SKU/Código</th>
                <th>Producto Padre</th>
                <th>Variante (Talla/Color)</th>
                <th>Stock Sistema</th>
                <th class="empty-col">Conteo Físico</th>
                <th class="empty-col">Diferencia</th>
            </tr>
        </thead>
        <tbody>
            @foreach($variants as $variant)
            <tr>
                <td>{{ $variant->sku }}</td>
                <td>{{ $variant->product->name }}</td>
                <td>{{ $variant->size }} / {{ $variant->color }}</td>
                <td style="text-align: center;">{{ $variant->stock }}</td>
                <td></td>
                <td></td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
