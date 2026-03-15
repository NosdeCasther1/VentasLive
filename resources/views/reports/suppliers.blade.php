<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Directorio de Proveedores</title>
    <style>
        body { font-family: sans-serif; font-size: 10pt; color: #334155; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #6366f1; padding-bottom: 10px; }
        h1 { color: #1e293b; margin: 0; font-size: 18pt; }
        .date { font-size: 8pt; color: #64748b; margin-top: 5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { background-color: #f8fafc; color: #475569; font-weight: bold; text-align: left; padding: 8px; border: 1px solid #e2e8f0; font-size: 8pt; text-transform: uppercase; }
        td { padding: 8px; border: 1px solid #e2e8f0; vertical-align: top; }
        .supplier-name { font-weight: bold; color: #334155; }
        .contact-info { font-size: 9pt; }
    </style>
</head>
<body>
    <div className="header">
        <h1>Directorio de Proveedores</h1>
        <div className="date">Generado el: {{ now()->format('d/m/Y H:i') }}</div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Nombre Comercial</th>
                <th>NIT</th>
                <th>Contacto</th>
                <th>Email</th>
                <th>Dirección</th>
            </tr>
        </thead>
        <tbody>
            @foreach($suppliers as $supplier)
            <tr>
                <td><span className="supplier-name">{{ $supplier->name }}</span></td>
                <td>{{ $supplier->nit ?: 'N/A' }}</td>
                <td>
                    {{ $supplier->phone ?: '---' }}<br>
                    <small>{{ $supplier->contact_info }}</small>
                </td>
                <td>{{ $supplier->email ?: '---' }}</td>
                <td>{{ $supplier->address ?: '---' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
