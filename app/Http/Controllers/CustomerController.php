<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index()
    {
        $products = \App\Models\Product::with(['category', 'variants'])->get();
        $categories = \App\Models\Category::all();
        $suppliers = \App\Models\Supplier::all();
        $customers = Customer::withCount('sales')
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
            'activeTab' => 'clientes',
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

    public function store(Request $request)
    {
        $request->validate([
            'full_name' => 'required|string|max:255',
            'social_handle' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'default_address' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $data = $request->all();
        $data['full_name'] = trim($data['full_name']);
        if (isset($data['phone'])) $data['phone'] = trim($data['phone']);
        if (isset($data['email'])) $data['email'] = trim($data['email']);

        $existing = Customer::where('full_name', $data['full_name'])
            ->where('phone', $data['phone'] ?? null)
            ->first();

        if ($existing) {
            if ($request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'customer' => $existing->loadCount('sales'),
                    'is_duplicate' => true
                ]);
            }

            return redirect()->back()->with([
                'warning' => 'Este cliente ya existe.',
                'newCustomer' => $existing->loadCount('sales')
            ]);
        }

        $customer = Customer::create($data);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'customer' => $customer->loadCount('sales')
            ]);
        }

        return redirect()->back()->with([
            'success' => 'Cliente creado correctamente.',
            'newCustomer' => $customer->loadCount('sales')
        ]);
    }

    public function update(Request $request, Customer $customer)
    {
        $request->validate([
            'full_name' => 'required|string|max:255',
            'social_handle' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'default_address' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $customer->update($request->all());

        return redirect()->back()->with('success', 'Cliente actualizado correctamente.');
    }

    public function destroy(Customer $customer)
    {
        $customer->delete();
        return redirect()->back()->with('success', 'Cliente eliminado correctamente.');
    }

    public function searchAPI(Request $request)
    {
        $q = $request->query('q');

        if (!$q) {
            return response()->json([]);
        }

        $customers = Customer::where('full_name', 'LIKE', "%{$q}%")
            ->orWhere('social_handle', 'LIKE', "%{$q}%")
            ->orWhere('phone', 'LIKE', "%{$q}%")
            ->select('id', 'full_name', 'social_handle', 'phone', 'default_address')
            ->limit(10)
            ->get();

        return response()->json($customers);
    }
}
