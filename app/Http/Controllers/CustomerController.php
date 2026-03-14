<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index()
    {
        $customers = Customer::withCount('sales')->get();
        return Inertia::render('POSDashboard', [
            'customers' => $customers
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

        $customer = Customer::create($request->all());

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'customer' => $customer->loadCount('sales')
            ]);
        }

        return redirect()->back()->with('success', 'Cliente creado correctamente.');
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
