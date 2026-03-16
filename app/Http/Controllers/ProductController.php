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
        $products = Product::with(['category', 'variants'])->get();
        $categories = Category::all();
        $suppliers = Supplier::all();
        $customers = \App\Models\Customer::withCount('sales')
            ->orderBy('full_name', 'asc')
            ->get();
        $deliveries = \App\Models\Sale::with(['details.productVariant.product'])
            ->whereIn('sale_type', ['delivery', 'manual_delivery'])
            ->whereIn('shipping_status', ['pending_confirmation', 'packing', 'in_transit'])
            ->orderBy('created_at', 'desc')
            ->get();

        // --- DASHBOARD ANALYTICS ---
        $today = \Carbon\Carbon::today();
        $salesToday = \App\Models\Sale::whereDate('created_at', $today)
            ->where('status', 'completed')
            ->sum('total');

        $weeklyPerformance = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = \Carbon\Carbon::today()->subDays($i);
            $dayName = $date->translatedFormat('D');
            $amount = \App\Models\Sale::whereDate('created_at', $date)
                ->where('status', 'completed')
                ->sum('total');
            $weeklyPerformance[] = ['day' => $dayName, 'amount' => $amount];
        }

        $recentActivity = \App\Models\Sale::with(['customer'])
            ->orderBy('created_at', 'desc')
            ->limit(8)
            ->get()
            ->map(function($sale) {
                $time = $sale->created_at->diffForHumans();
                $icon = $sale->status === 'live_draft' ? 'ShoppingBag' : 'CheckCircle2';
                $color = $sale->status === 'live_draft' ? 'indigo' : 'emerald';
                $identifier = $sale->customer_name ?: ($sale->social_handle ? '@'.$sale->social_handle : 'Cliente General');
                $text = $sale->status === 'live_draft' ? "Nueva bolsa para $identifier" : "Venta completada: $identifier (Q {$sale->total})";
                return ['id' => $sale->id, 'text' => $text, 'time' => $time, 'icon' => $icon, 'color' => $color];
            });

        return Inertia::render('POSDashboard', [
            'activeTab' => 'dashboard',
            'products' => $products,
            'categories' => $categories,
            'suppliers' => $suppliers,
            'customers' => $customers,
            'deliveries' => $deliveries,
            'analytics' => [
                'salesToday' => $salesToday,
                'weeklyPerformance' => $weeklyPerformance,
                'recentActivity' => $recentActivity
            ],
            'settings' => \App\Models\Setting::all()->pluck('value', 'key'),
            'users' => \App\Models\User::all(),
            'activeSession' => \App\Models\LiveSession::where('status', 'active')->first(),
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
        return redirect()->route('products.index')->with('success', 'Producto eliminado correctamente.');
    }

    public function countSheet(Request $request)
    {
        $query = ProductVariant::with('product')
            ->join('products', 'product_variants.product_id', '=', 'products.id')
            ->select('product_variants.*');

        if ($request->filled('category') && $request->category !== 'all') {
            $query->where('products.category_id', $request->category);
        }

        if ($request->filled('stock')) {
            if ($request->stock === 'out_of_stock') {
                $query->where('product_variants.stock', '<=', 0);
            } elseif ($request->stock === 'low_stock') {
                $query->where('product_variants.stock', '>', 0)->where('product_variants.stock', '<=', 5);
            } elseif ($request->stock === 'in_stock') {
                $query->where('product_variants.stock', '>', 0);
            }
        }

        $variants = $query->orderBy('products.name')->get();

        $pdf = Pdf::loadView('reports.inventory-count', compact('variants'));
        return $pdf->stream('Hoja_Conteo_Inventario.pdf');
    }

    public function adjustStock(Request $request)
    {
        $request->validate([
            'product_variant_id' => 'required|exists:product_variants,id',
            'type' => 'required|in:addition,subtraction',
            'quantity' => 'required|integer|min:1',
            'reason' => 'required|string|max:255',
        ]);

        $variant = ProductVariant::findOrFail($request->product_variant_id);
        
        // Create audit record
        \App\Models\InventoryAdjustment::create([
            'product_variant_id' => $variant->id,
            'user_id' => auth()->id(),
            'type' => $request->type,
            'quantity' => $request->quantity,
            'reason' => $request->reason,
        ]);

        // Update stock
        if ($request->type === 'addition') {
            $variant->increment('stock', $request->quantity);
        } else {
            $variant->decrement('stock', $request->quantity);
        }

        return redirect()->back()->with('success', 'Ajuste de inventario realizado correctamente.');
    }

    public function adjustmentHistory()
    {
        $adjustments = \App\Models\InventoryAdjustment::with(['variant.product', 'user'])
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($adjustments);
    }
}
