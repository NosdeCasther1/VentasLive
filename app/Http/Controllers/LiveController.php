<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\SaleDetail;
use App\Models\ProductVariant;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class LiveController extends Controller
{
    public function addItemToBag(Request $request)
    {
        $request->validate([
            'social_handle' => 'required|string',
            'variant_id' => 'required|exists:product_variants,id',
            'quantity' => 'required|integer|min:1',
        ]);

        return DB::transaction(function () use ($request) {
            // 1. Get or create the live_draft sale for this social_handle
            // Note: We use social_handle as the primary key for live bags
            $sale = Sale::firstOrCreate(
                [
                    'social_handle' => $request->social_handle,
                    'status' => 'live_draft',
                ],
                [
                    'customer_name' => $request->social_handle, // Use handle as name initially
                    'sale_type' => 'delivery',
                    'total' => 0,
                    'shipping_status' => 'pending_confirmation',
                ]
            );

            // 2. Lock and check inventory
            $variant = ProductVariant::lockForUpdate()->findOrFail($request->variant_id);
            
            if ($variant->stock < $request->quantity) {
                return response()->json(['error' => "Stock insuficiente para {$variant->product->name}. Disponible: {$variant->stock}"], 422);
            }

            // 3. Create or update sale detail
            $detail = SaleDetail::where('sale_id', $sale->id)
                ->where('product_variant_id', $variant->id)
                ->first();

            if ($detail) {
                $detail->increment('quantity', $request->quantity);
            } else {
                SaleDetail::create([
                    'sale_id' => $sale->id,
                    'product_variant_id' => $variant->id,
                    'quantity' => $request->quantity,
                    'selling_price' => $variant->selling_price,
                    'historical_cost' => $variant->average_cost,
                ]);
            }

            // 4. Update inventory: stock - quantity, reserved + quantity
            $variant->decrement('stock', $request->quantity);
            $variant->increment('reserved', $request->quantity);

            // 5. Update sale total
            $sale->increment('total', $variant->selling_price * $request->quantity);

            return response()->json([
                'message' => 'Producto agregado a la bolsa',
                'bag' => $sale->load('details.productVariant.product')
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
            $sale->load('details.productVariant.product');
            
            return response()->json([
                'message' => 'Producto eliminado de la bolsa',
                'bag' => $sale
            ]);
        });
    }

    public function getBags()
    {
        $bags = Sale::with(['details.productVariant.product'])
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
        ]);

        try {
            return DB::transaction(function () use ($request, $sale) {
                // 1. Associate or create Customer
                $customer = Customer::firstOrCreate(
                    ['social_handle' => $sale->social_handle],
                    [
                        'full_name' => $request->customer_name,
                        'phone' => $request->customer_phone,
                        'default_address' => $request->shipping_address,
                    ]
                );

                // 2. Update sale to formal status
                $sale->update([
                    'customer_id' => $customer->id,
                    'customer_name' => $request->customer_name,
                    'customer_phone' => $request->customer_phone,
                    'shipping_address' => $request->shipping_address,
                    'shipping_phone' => $request->customer_phone,
                    'shipping_cost' => $request->shipping_cost,
                    'total' => $sale->total + $request->shipping_cost,
                    'status' => 'completed',
                    'shipping_status' => 'pending_confirmation',
                    'payment_status' => $request->payment_status === 'Pago Contra Entrega' ? 'pending_cod' : 'paid',
                    'payment_method' => $request->payment_status === 'Pagado' ? 'Transferencia/Previo' : 'Contra Entrega',
                ]);

                // Note: Inventory was already subtracted from stock and added to reserved in addItemToBag.
                // In this system, 'completed' sales in logistics will have their reserved status cleared
                // when the POSController@store (or similar) is called, or we could do it here if this was the final step.
                // But for 'live_draft', we keep it reserved until it moves through the packing/shipping flow.
                
                return response()->json([
                    'message' => 'Bolsa agendada correctamente. Movida a Logística.',
                    'sale' => $sale
                ]);
            });
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al procesar el checkout: ' . $e->getMessage()], 500);
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

                return response()->json(['message' => 'Bolsa cancelada e inventario liberado']);
            });
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al cancelar la bolsa: ' . $e->getMessage()], 500);
        }
    }
}
