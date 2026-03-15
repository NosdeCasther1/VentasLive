<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Sale;
use App\Models\SaleDetail;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\DB;

use App\Models\User;
use App\Notifications\LowStockNotification;

class POSController extends Controller
{
    public function index()
    {
        $products = \App\Models\Product::with(['category', 'variants'])->get();
        $categories = \App\Models\Category::all();
        $suppliers = \App\Models\Supplier::all();
        $customers = \App\Models\Customer::withCount('sales')->get();
        $deliveries = Sale::with(['details.productVariant.product'])
            ->where('sale_type', 'delivery')
            ->whereIn('shipping_status', ['pending_confirmation', 'packing', 'in_transit'])
            ->orderBy('created_at', 'desc')
            ->get();

        // --- DASHBOARD ANALYTICS ---
        $today = \Carbon\Carbon::today();
        
        // 1. Ventas de hoy (monetario)
        $salesToday = Sale::whereDate('created_at', $today)
            ->where('status', 'completed')
            ->sum('total');

        // 2. Rendimiento semanal (últimos 7 días)
        $weeklyPerformance = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = \Carbon\Carbon::today()->subDays($i);
            $dayName = $date->translatedFormat('D');
            $amount = Sale::whereDate('created_at', $date)
                ->where('status', 'completed')
                ->sum('total');
            
            $weeklyPerformance[] = [
                'day' => $dayName,
                'amount' => $amount
            ];
        }

        // 3. Actividad Reciente (últimos 10 registros de ventas o bolsas)
        $recentActivity = Sale::with(['customer'])
            ->orderBy('created_at', 'desc')
            ->limit(8)
            ->get()
            ->map(function($sale) {
                $time = $sale->created_at->diffForHumans();
                $icon = $sale->status === 'live_draft' ? 'ShoppingBag' : 'CheckCircle2';
                $color = $sale->status === 'live_draft' ? 'indigo' : 'emerald';
                
                $identifier = $sale->customer_name ?: ($sale->social_handle ? '@'.$sale->social_handle : 'Cliente General');
                $text = $sale->status === 'live_draft' 
                    ? "Nueva bolsa para $identifier" 
                    : "Venta completada: $identifier (Q {$sale->total})";

                return [
                    'id' => $sale->id,
                    'text' => $text,
                    'time' => $time,
                    'icon' => $icon,
                    'color' => $color
                ];
            });

        return Inertia::render('POSDashboard', [
            'products' => $products,
            'categories' => $categories,
            'suppliers' => $suppliers,
            'customers' => $customers,
            'deliveries' => $deliveries,
            'analytics' => [
                'salesToday' => $salesToday,
                'weeklyPerformance' => $weeklyPerformance,
                'recentActivity' => $recentActivity
            ]
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'customer_id' => 'nullable|exists:customers,id',
            'customer_name' => 'nullable|string|max:255',
            'sale_type' => 'required|string|in:local,shipping',
            'items' => 'required|array|min:1',
            'items.*.variant_id' => 'required|exists:product_variants,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.is_reserved' => 'boolean',
            'payment_method' => 'nullable|string',
            'amount_received' => 'nullable|numeric|min:0',
            'change' => 'nullable|numeric|min:0',
            'shipping_address' => 'nullable|string|max:500',
            'shipping_phone' => 'nullable|string|max:50',
            'shipping_cost' => 'nullable|numeric|min:0',
            'payment_status' => 'nullable|string',
        ]);

        $saleId = DB::transaction(function () use ($request) {
            $total = 0;
            foreach ($request->items as $item) {
                $total += $item['price'] * $item['quantity'];
            }

            $openRegister = \App\Models\CashRegister::where('user_id', auth()->id())
                ->where('status', 'open')
                ->first();

            $sale = Sale::create([
                'customer_id' => $request->customer_id,
                'customer_name' => $request->customer_name,
                'total' => $total,
                'sale_type' => $request->sale_type,
                'status' => 'completed',
                'payment_method' => $request->payment_method,
                'amount_received' => $request->amount_received,
                'change' => $request->change,
                'shipping_address' => $request->shipping_address,
                'shipping_phone' => $request->shipping_phone,
                'shipping_cost' => $request->shipping_cost,
                'payment_status' => $request->payment_status,
                'cash_register_id' => ($request->payment_method === 'cash' && $openRegister) ? $openRegister->id : null,
            ]);

            foreach ($request->items as $item) {
                // Lock the row to prevent race conditions when reading average_cost and stock
                $variant = ProductVariant::lockForUpdate()->find($item['variant_id']);
                
                SaleDetail::create([
                    'sale_id' => $sale->id,
                    'product_variant_id' => $variant->id,
                    'quantity' => $item['quantity'],
                    'selling_price' => $item['price'],
                    'historical_cost' => $variant->average_cost,
                ]);

                // Update stock and reserved
                $variant->stock -= $item['quantity'];
                if (isset($item['is_reserved']) && $item['is_reserved']) {
                    $variant->reserved -= $item['quantity'];
                    if ($variant->reserved < 0) {
                        $variant->reserved = 0;
                    }
                }
                
                $variant->save();

                // Notification check
                if ($variant->stock <= 2) {
                    $admins = User::where('role', 'admin')->get();
                    $notification = new LowStockNotification($variant->product->name . " ({$variant->size} {$variant->color})", $variant->stock);
                    /** @var \App\Models\User $admin */
                    foreach ($admins as $admin) {
                        $admin->notify($notification);
                    }
                }
            }

            return $sale->id;
        });

        // Get the full sale with details for printing the receipt
        $sale = Sale::with(['details.productVariant.product'])->find($saleId);

        return redirect()->back()->with([
            'success' => 'Venta registrada con éxito.',
            'sale' => $sale,
        ]);
    }

    public function storeDelivery(Request $request)
    {
        $request->validate([
            'customer_id' => 'nullable|exists:customers,id',
            'customer_name' => 'nullable|string|max:255',
            'customer_phone' => 'nullable|string|max:50',
            'items' => 'required|array|min:1',
            'items.*.variant_id' => 'required|exists:product_variants,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.is_reserved' => 'boolean',
            'shipping_address' => 'required|string|max:500',
            'shipping_phone' => 'required|string|max:50',
            'shipping_cost' => 'required|numeric|min:0',
            'payment_status' => 'required|string|in:Pagado,Pago Contra Entrega',
        ]);

        $saleId = DB::transaction(function () use ($request) {
            $cartTotal = 0;
            foreach ($request->items as $item) {
                $cartTotal += $item['price'] * $item['quantity'];
            }

            $total = $cartTotal + $request->shipping_cost;

            $sale = Sale::create([
                'customer_id' => $request->customer_id,
                'customer_name' => $request->customer_name,
                'customer_phone' => $request->customer_phone ?? $request->shipping_phone,
                'total' => $total,
                'sale_type' => 'delivery',
                'status' => 'completed',
                'payment_method' => $request->payment_status === 'Pagado' ? 'Transferencia/Previo' : 'Contra Entrega',
                'shipping_address' => $request->shipping_address,
                'shipping_phone' => $request->shipping_phone,
                'shipping_cost' => $request->shipping_cost,
                'shipping_status' => 'packing',
                'payment_status' => $request->payment_status === 'Pago Contra Entrega' ? 'pending_cod' : 'paid',
            ]);

            foreach ($request->items as $item) {
                // Lock the row to prevent race conditions when reading average_cost and stock
                $variant = ProductVariant::lockForUpdate()->find($item['variant_id']);

                SaleDetail::create([
                    'sale_id' => $sale->id,
                    'product_variant_id' => $variant->id,
                    'quantity' => $item['quantity'],
                    'selling_price' => $item['price'],
                    'historical_cost' => $variant->average_cost,
                ]);

                // Update stock and reserved
                $variant->stock -= $item['quantity'];
                if (isset($item['is_reserved']) && $item['is_reserved']) {
                    $variant->reserved -= $item['quantity'];
                    if ($variant->reserved < 0) {
                        $variant->reserved = 0;
                    }
                }
                
                $variant->save();
            }

            return $sale->id;
        });

        // Get the full sale with details for printing the receipt
        $sale = Sale::with(['details.productVariant.product'])->find($saleId);

        return redirect()->back()->with([
            'success' => 'Orden de envío registrada con éxito.',
            'sale' => $sale,
        ]);
    }

    public function updateShippingStatus(Request $request, Sale $sale)
    {
        $request->validate([
            'shipping_status' => 'required|string|in:pending_confirmation,packing,in_transit,delivered',
        ]);

        if ($request->shipping_status === 'packing' && empty($sale->shipping_address)) {
            return redirect()->back()->withErrors(['shipping_address' => 'Se requiere una dirección de envío para pasar a "Empacando".']);
        }

        $sale->update([
            'shipping_status' => $request->shipping_status,
        ]);

        return redirect()->back()->with('success', 'Estado de envío actualizado.');
    }

    public function updateShippingAddress(Request $request, Sale $sale)
    {
        $request->validate([
            'shipping_address' => 'required|string|max:500',
        ]);

        $sale->update([
            'shipping_address' => $request->shipping_address,
        ]);

        return redirect()->back()->with('success', 'Dirección actualizada.');
    }

    public function driverManifest()
    {
        $deliveries = Sale::with(['details.productVariant.product'])
            ->where('sale_type', 'delivery')
            ->where('shipping_status', 'in_transit')
            ->orderBy('created_at', 'desc')
            ->get();

        return view('reports.driver_manifest', compact('deliveries'));
    }

    public function storeManualDelivery(Request $request)
    {
        $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:50',
            'shipping_address' => 'required|string|max:500',
            'package_description' => 'required|string',
            'shipping_cost' => 'required|numeric|min:0',
            'total' => 'required|numeric|min:0', // El "Monto a Cobrar"
        ]);

        $sale = Sale::create([
            'customer_name' => $request->customer_name,
            'customer_phone' => $request->customer_phone,
            'shipping_phone' => $request->customer_phone,
            'shipping_address' => $request->shipping_address,
            'package_description' => $request->package_description,
            'shipping_cost' => $request->shipping_cost,
            'total' => $request->total,
            'sale_type' => 'manual_delivery',
            'status' => 'completed',
            'shipping_status' => 'packing',
            'payment_method' => 'Contra Entrega',
            'payment_status' => 'pending_cod',
        ]);

        return redirect()->back()->with('success', 'Envío independiente creado correctamente.');
    }
}
