<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\SaleDetail;
use App\Models\ProductVariant;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use App\Notifications\LowStockNotification;
use App\Models\User;
use App\Models\LiveSession;
use Inertia\Inertia;

class LiveController extends Controller
{
    public function addItemToBag(Request $request)
    {
        $request->validate([
            'social_handle' => 'nullable|string',
            'client_id' => 'nullable|exists:customers,id',
            'variant_id' => 'required|exists:product_variants,id',
            'quantity' => 'required|integer|min:1',
        ]);

        if (!$request->social_handle && !$request->client_id) {
            return response()->json(['error' => 'Debe proporcionar un usuario o seleccionar un cliente'], 422);
        }

        return DB::transaction(function () use ($request) {
            // 1. Get or create the live_draft sale
            if ($request->client_id) {
                $sale = Sale::where('customer_id', $request->client_id)
                    ->where('status', 'live_draft')
                    ->first();
            } else {
                $sale = Sale::where('social_handle', $request->social_handle)
                    ->where('status', 'live_draft')
                    ->first();
            }
            
            $isNewBag = !$sale;

            if ($isNewBag) {
                $customer = null;
                if ($request->client_id) {
                    $customer = Customer::find($request->client_id);
                }

                $sale = Sale::create([
                    'social_handle' => $request->social_handle ?: ($customer ? $customer->social_handle : null),
                    'customer_id' => $request->client_id,
                    'status' => 'live_draft',
                    'customer_name' => $customer ? $customer->full_name : $request->social_handle,
                    'sale_type' => 'delivery',
                    'total' => 0,
                    'shipping_status' => 'pending_confirmation',
                ]);

                // Notify admins about pending bags
                $count = Sale::where('status', 'live_draft')->count();
                $admins = User::where('role', 'admin')->get();
                $notification = new \App\Notifications\PendingLiveBagsNotification($count);
                /** @var \App\Models\User $admin */
                foreach ($admins as $admin) {
                    $admin->notify($notification);
                }
            }

            // 2. Lock and check inventory
            $variant = ProductVariant::with('product.category')->lockForUpdate()->findOrFail($request->variant_id);
            
            if ($variant->stock < $request->quantity) {
                return response()->json(['error' => "Stock insuficiente para {$variant->product->name}. Disponible: {$variant->stock}"], 422);
            }

            // Validation: Max discount limit
            $discount = floatval($request->discount ?? 0);
            if ($discount > 0 && auth()->user()->role === 'cashier') {
                $maxPossible = $variant->product->category->max_discount_percent ?? 0;
                if ($discount > $maxPossible) {
                    return response()->json(['error' => "El descuento solicitado ($discount%) excede el límite permitido para esta categoría ($maxPossible%)"], 422);
                }
            }

            $discountAmount = ($variant->selling_price * ($discount / 100));
            $finalPrice = $variant->selling_price - $discountAmount;

            // 3. Create or update sale detail
            $detail = SaleDetail::where('sale_id', $sale->id)
                ->where('product_variant_id', $variant->id)
                ->where('discount', $discount)
                ->first();

            if ($detail) {
                $detail->increment('quantity', $request->quantity);
            } else {
                SaleDetail::create([
                    'sale_id' => $sale->id,
                    'product_variant_id' => $variant->id,
                    'quantity' => $request->quantity,
                    'discount' => $discount,
                    'selling_price' => $variant->selling_price,
                    'historical_cost' => $variant->average_cost,
                ]);
            }

            // 4. Update inventory: stock - quantity, reserved + quantity
            $variant->decrement('stock', $request->quantity);
            $variant->increment('reserved', $request->quantity);

            // 5. Update sale total
            $sale->increment('total', $finalPrice * $request->quantity);

            // 6. Check for Low Stock Notification
            if ($variant->stock <= 2) {
                $admins = User::where('role', 'admin')->get();
                $notification = new LowStockNotification($variant->product->name . " ({$variant->size} {$variant->color})", $variant->stock);
                /** @var \App\Models\User $admin */
                foreach ($admins as $admin) {
                    $admin->notify($notification);
                }
            }

            return response()->json([
                'message' => 'Producto agregado a la bolsa',
                'bag' => $sale->load('details.productVariant.product.category')
            ]);
        });
    }

    public function removeItem(Request $request)
    {
        $request->validate([
            'detail_id' => 'required|exists:sale_details,id',
        ]);

        return DB::transaction(function () use ($request) {
            $detail = SaleDetail::with(['sale', 'productVariant'])->findOrFail($request->detail_id);
            $sale = $detail->sale;
            $variant = $detail->productVariant;

            // Only allow removal if status is live_draft
            if ($sale->status !== 'live_draft') {
                return response()->json(['error' => 'No se puede modificar una venta confirmada'], 422);
            }

            // 1. Revert inventory: stock + quantity, reserved - quantity
            $variant->increment('stock', $detail->quantity);
            $variant->decrement('reserved', $detail->quantity);

            // 2. Update sale total
            $sale->decrement('total', $detail->selling_price * $detail->quantity);

            // 3. Delete detail
            $detail->delete();

            // 4. Reload bag to return updated state
            $sale->load('details.productVariant.product.category');
            
            return response()->json([
                'message' => 'Producto eliminado de la bolsa',
                'bag' => $sale
            ]);
        });
    }

    public function getBags()
    {
        $bags = Sale::with(['details.productVariant.product.category'])
            ->where('status', 'live_draft')
            ->orderBy('updated_at', 'desc')
            ->get();

        return response()->json($bags);
    }

    public function checkout(Request $request, Sale $sale)
    {
        $request->validate([
            'customer_name' => 'required|string',
            'customer_phone' => 'required|string|max:8',
            'shipping_address' => 'required|string',
            'shipping_cost' => 'required|numeric|min:0',
            'payment_status' => 'required|string',
            'discount' => 'nullable|numeric|min:0',
            'delivery_date' => 'required|date',
            'delivery_time' => 'required|string',
        ]);

        $user = auth()->user();
        $saleDetails = $sale->details()->get();
        $subtotal = $saleDetails->sum(fn($d) => $d->selling_price * $d->quantity);
        $totalPMP = $saleDetails->sum(fn($d) => $d->historical_cost * $d->quantity);
        $discount = $request->discount ?? 0;
        $precioFinal = $subtotal - $discount;

        // Reglas de Negocio Anti-Pérdidas con Límite Dinámico por Categoría
        $maxDiscountAllowed = 0;
        foreach ($saleDetails as $detail) {
            $variant = $detail->productVariant;
            $itemSubtotal = $detail->selling_price * $detail->quantity;
            $categoryLimit = $variant->product->category->max_discount_percent ?? 0;
            $maxDiscountAllowed += ($itemSubtotal * ($categoryLimit / 100));
        }

        if ($user->role === 'cashier') {
            if ($subtotal > 0 && $discount > ($maxDiscountAllowed + 0.01)) {
                return response()->json(['error' => "Límite excedido. Para esta combinación de productos, el descuento máximo permitido es Q " . number_format($maxDiscountAllowed, 2)], 403);
            }
            if ($precioFinal < $totalPMP) {
                return response()->json(['error' => "Alerta de Pérdida: No puedes vender por debajo del costo de inventario (Q " . number_format($totalPMP, 2) . ")."], 403);
            }
        } elseif ($user->role === 'admin') {
            if ($precioFinal < $totalPMP || ($subtotal > 0 && $discount > $maxDiscountAllowed)) {
                \Log::warning("Checkout Live autorizado por admin con pérdida o descuento superior al límite de categoría. Usuario: {$user->name}, Venta ID: {$sale->id}, Total PMP: Q {$totalPMP}, Precio Final: Q {$precioFinal}, Descuento Aplicado: Q {$discount}, Máximo Permitido: Q {$maxDiscountAllowed}");
            }
        }

        try {
            DB::transaction(function () use ($request, $sale, $discount, $subtotal) {
                // 1. Associate or create Customer
                $customer = Customer::firstOrCreate(
                    ['social_handle' => $sale->social_handle],
                    [
                        'full_name' => $request->customer_name,
                        'phone' => $request->customer_phone,
                        'default_address' => $request->shipping_address,
                    ]
                );

                // 2. Update sale to formal status (This "converts" the bag into a formal order)
                $sale->update([
                    'customer_id' => $customer->id,
                    'customer_name' => $request->customer_name,
                    'customer_phone' => $request->customer_phone,
                    'shipping_address' => $request->shipping_address,
                    'shipping_phone' => $request->customer_phone,
                    'shipping_cost' => $request->shipping_cost,
                    'total' => ($subtotal - $discount) + $request->shipping_cost,
                    'discount' => $discount,
                    'status' => 'completed', // Cambiamos de 'live_draft' a 'completed' para que sea una venta formal
                    'shipping_status' => 'pending_confirmation', // Estado inicial para que aparezca en el Kanban de Logística
                    'payment_status' => $request->payment_status === 'Pago Contra Entrega' ? 'pending_cod' : 'paid',
                    'payment_method' => $request->payment_status === 'Pagado' ? 'Transferencia/Previo' : 'Contra Entrega',
                    'delivery_date' => $request->delivery_date,
                    'delivery_time' => $request->delivery_time,
                ]);
            });

            if ($request->header('X-Inertia')) {
                return back()->with('success', '¡Venta agendada! Enviada a Logística.');
            }
            
            if ($request->wantsJson()) {
                return response()->json([
                    'status' => 'success',
                    'message' => '¡Venta agendada! Enviada a Logística.',
                    'sale' => $sale->fresh()
                ]);
            }
            
            return back()->with('success', '¡Venta agendada! Enviada a Logística.');
        } catch (\Exception $e) {
            if ($request->header('X-Inertia')) {
                return back()->withErrors(['error' => 'Error al procesar el checkout: ' . $e->getMessage()]);
            }
            
            if ($request->wantsJson()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Error al procesar el checkout: ' . $e->getMessage()
                ], 500);
            }
            return back()->withErrors(['error' => 'Error al procesar el checkout: ' . $e->getMessage()]);
        }
    }

    public function processAI(Request $request)
    {
        $request->validate(['text' => 'required|string']);

        $apiKey = env('GEMINI_API_KEY') ?: env('VITE_GEMINI_API_KEY');
        if (!$apiKey) {
            return response()->json(['error' => 'Gemini API Key not configured'], 500);
        }

        $prompt = "Eres un asistente de ventas para un Live Stream. Extrae del texto los siguientes campos y devuélvelos estrictamente en JSON:\n" .
                  "- usuario: el nombre de la persona (exactamente como aparezca, con su @ o sin él)\n" .
                  "- producto: nombre breve del producto\n" .
                  "- variante: talla o color\n" .
                  "- cantidad: número entero (default 1)\n\n" .
                  "No agregues explicaciones, solo el JSON.\n\n" .
                  "Texto a analizar: \"" . $request->text . "\"";

        try {
            $response = Http::post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={$apiKey}", [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'responseMimeType' => 'application/json',
                ]
            ]);

            if ($response->failed()) {
                return response()->json(['error' => 'Error al contactar con la IA'], 500);
            }

            $data = $response->json();
            $textResult = $data['candidates'][0]['content']['parts'][0]['text'] ?? '{}';
            
            // Clean markdown blocks
            $textResult = preg_replace('/^```json\s*|\s*```$/', '', trim($textResult));
            
            $decoded = json_decode($textResult, true);
            
            if (!$decoded) {
                return response()->json(['error' => 'La IA devolvió un formato inválido'], 500);
            }

            // Normalizar llaves por si acaso la IA usa inglés o variaciones
            $normalized = [
                'usuario' => $decoded['usuario'] ?? $decoded['user'] ?? $decoded['username'] ?? '',
                'producto' => $decoded['producto'] ?? $decoded['product'] ?? '',
                'variante' => $decoded['variante'] ?? $decoded['variant'] ?? $decoded['size'] ?? '',
                'cantidad' => $decoded['cantidad'] ?? $decoded['quantity'] ?? $decoded['amount'] ?? 1,
            ];

            return response()->json($normalized);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Error procesando la solicitud: ' . $e->getMessage()], 500);
        }
    }
    public function cancelBag(Sale $sale)
    {
        if ($sale->status !== 'live_draft') {
            return response()->json(['error' => 'Solo se pueden cancelar bolsas en estado borrador'], 422);
        }

        try {
            return DB::transaction(function () use ($sale) {
                $sale->load('details.productVariant');

                foreach ($sale->details as $detail) {
                    $variant = $detail->productVariant;
                    if ($variant) {
                        // Revert inventory: stock + quantity, reserved - quantity
                        $variant->increment('stock', $detail->quantity);
                        $variant->decrement('reserved', $detail->quantity);
                    }
                }

                $sale->delete(); // Eliminar la bolsa por completo

                if (request()->wantsJson()) {
                    return response()->json(['message' => 'Bolsa cancelada e inventario liberado']);
                }
                return back()->with('success', 'Bolsa cancelada e inventario liberado.');
            });
        } catch (\Exception $e) {
            if (request()->wantsJson()) {
                return response()->json(['error' => 'Error al cancelar la bolsa: ' . $e->getMessage()], 500);
            }
            return back()->withErrors(['error' => 'Error al cancelar la bolsa: ' . $e->getMessage()]);
        }
    }
    public function startSession(Request $request)
    {
        $request->validate(['name' => 'required|string|max:255']);

        $session = LiveSession::create([
            'name' => $request->name,
            'started_at' => now(),
            'status' => 'active',
        ]);

        return response()->json($session);
    }

    public function endSession(LiveSession $session)
    {
        $session->update([
            'ended_at' => now(),
            'status' => 'ended',
        ]);

        // Get some stats for the summary
        $bagsCount = Sale::where('status', 'live_draft')->count();
        
        return response()->json([
            'message' => 'Transmisión finalizada',
            'duration' => $session->started_at->diffForHumans($session->ended_at, true),
            'bags_count' => $bagsCount,
        ]);
    }
}
