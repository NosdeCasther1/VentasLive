<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Supplier;

class SupplierController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'nit' => 'nullable|string|max:20',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'contact_info' => 'nullable|string',
        ]);

        Supplier::create($validated);

        return redirect()->back()->with('success', 'Proveedor creado exitosamente.');
    }

    public function update(Request $request, Supplier $supplier)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'nit' => 'nullable|string|max:20',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'contact_info' => 'nullable|string',
        ]);

        $supplier->update($validated);

        return redirect()->back()->with('success', 'Proveedor actualizado exitosamente.');
    }

    public function destroy(Supplier $supplier)
    {
        $supplier->delete();
        return redirect()->route('products.index')->with('success', 'Proveedor eliminado exitosamente.');
    }

    public function exportPdf()
    {
        $suppliers = Supplier::orderBy('name')->get();
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('reports.suppliers', compact('suppliers'));
        return $pdf->download('Directorio_Proveedores_' . now()->format('Ymd') . '.pdf');
    }

    public function exportExcel()
    {
        $suppliers = Supplier::orderBy('name')->get();
        
        $filename = 'Directorio_Proveedores_' . now()->format('Ymd') . '.csv';
        
        $headers = [
            "Content-Type" => "text/csv; charset=UTF-8",
            "Content-Disposition" => "attachment; filename=\"$filename\"",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $callback = function() use($suppliers) {
            $file = fopen('php://output', 'w');
            // Byte Order Mark for Excel UTF-8 support
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));
            
            fputcsv($file, ['Nombre Comercial', 'NIT', 'Telefono', 'Email', 'Direccion', 'Contacto Extra']);

            foreach ($suppliers as $supplier) {
                fputcsv($file, [
                    $supplier->name,
                    $supplier->nit,
                    $supplier->phone,
                    $supplier->email,
                    $supplier->address,
                    $supplier->contact_info,
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
