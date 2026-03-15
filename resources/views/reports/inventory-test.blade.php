<!DOCTYPE html>
<html>
<head>
    <title>Test PDF</title>
</head>
<body>
    <h1>Test PDF Content</h1>
    <table>
        @foreach($variants as $v)
            <tr><td>{{ $v->sku }}</td></tr>
        @endforeach
    </table>
</body>
</html>
