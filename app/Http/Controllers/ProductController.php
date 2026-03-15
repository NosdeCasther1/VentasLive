<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Models\Supplier;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class ProductController extends Controller
{
    public function index()
    {
        return Inertia::render('POSDashboard', [
            'products' => Product::with(['category', 'variants'])->get(),
            'categories' => Category::all(),
            'suppliers' => Supplier::all(),
            'deliveries' => \App\Models\Sale::with(['details.productVariant.product'])
                ->where('sale_type', 'delivery')
                ->whereIn('shipping_status', ['pending_confirmation', 'packing', 'in_transit'])
                ->orderBy('created_at', 'desc')
                ->get(),
            'settings' => \App\Models\Setting::all()->pluck('value', 'key'),
            'users' => \App\Models\User::all(),
        ]);
    }

    public function create()
    {
        //
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'image_url' => 'nullable|string',
            'variants' => 'required|array|min:1',
            'variants.*.sku' => 'required|string|unique:product_variants,sku',
            'variants.*.size' => 'nullable|string|max:50',
            'variants.*.color' => 'nullable|string|max:50',
            'variants.*.selling_price' => 'required|numeric|min:0',
        ]);

        $product = Product::create([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'category_id' => $validated['category_id'],
            'image_url' => $validated['image_url'],
        ]);

        foreach ($validated['variants'] as $variant) {
            $product->variants()->create([
                'sku' => $variant['sku'],
                'size' => $variant['size'] ?? null,
                'color' => $variant['color'] ?? null,
                'selling_price' => $variant['selling_price'],
                'stock' => 0,
                'average_cost' => 0,
                'reserved' => 0,
            ]);
        }

        return redirect()->back()->with('success', 'Producto y variantes creados correctamente.');
    }

    public function show(string $id)
    {
        //
    }

    public function edit(string $id)
    {
        //
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'image_url' => 'nullable|string',
        ]);

        $product->update($validated);

        return redirect()->back()->with('success', 'Producto actualizado correctamente.');
    }

    public function destroy(Product $product)
    {
        $product->delete();
        return redirect()->back()->with('success', 'Producto eliminado correctamente.');
    }

    public function countSheet()
    {
        $variants = ProductVariant::with(['product.category'])
            ->join('products', 'product_variants.product_id', '=', 'products.id')
            ->orderBy('products.name')
            ->select('product_variants.*')
            ->get();

        $pdf = Pdf::loadView('reports.inventory-count', compact('variants'));
        return $pdf->download('hoja-conteo-' . date('Y-m-d') . '.pdf');
    }
}
