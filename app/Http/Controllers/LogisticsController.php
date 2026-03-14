<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LogisticsController extends Controller
{
    /**
     * Cancela una orden y libera el inventario reservado.
     *
     * @param  \App\Models\Sale  $sale
     * @return \Illuminate\Http\JsonResponse
     */
    public function cancelOrder(Sale $sale)
    {
        try {
            return DB::transaction(function () use ($sale) {
                // 1. Verificar que el pedido no esté ya entregado o cancelado
                if ($sale->shipping_status === 'delivered') {
                    return response()->json(['error' => 'No se puede cancelar un pedido que ya ha sido entregado.'], 422);
                }
                
                if ($sale->shipping_status === 'cancelled') {
                    return response()->json(['error' => 'El pedido ya se encuentra cancelado.'], 422);
                }

                // 2. Cambiar estado a cancelado
                $sale->update([
                    'shipping_status' => 'cancelled',
                    'status' => 'cancelled',
                    'cancelled_at' => now(),
                ]);

                // 3. Revertir inventario
                // Cargamos los detalles si no están cargados
                $sale->load('details');

                foreach ($sale->details as $detail) {
                    $variant = ProductVariant::lockForUpdate()->find($detail->product_variant_id);
                    
                    if ($variant) {
                        // Sumar al stock (vuelve a estar disponible físicamente)
                        $variant->increment('stock', $detail->quantity);
                        
                        // Restar de reserved (deja de estar comprometido)
                        // Aseguramos que no sea negativo por si acaso
                        $newReserved = max(0, $variant->reserved - $detail->quantity);
                        $variant->update(['reserved' => $newReserved]);
                    }
                }

                return response()->json([
                    'message' => 'Pedido cancelado con éxito. El inventario ha sido liberado.',
                    'sale_id' => $sale->id
                ]);
            });
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al cancelar el pedido: ' . $e->getMessage()
            ], 500);
        }
    }
}
