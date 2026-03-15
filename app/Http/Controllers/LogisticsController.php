<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

use App\Models\User;
use App\Notifications\OrderReturnedNotification;

class LogisticsController extends Controller
{
    /**
     * Muestra la vista para el motorista con los pedidos en tránsito.
     */
    public function driverIndex()
    {
        $orders = Sale::with(['details.product_variant.product'])
            ->where('shipping_status', 'shipped')
            ->orderBy('id', 'desc')
            ->get();

        return \Inertia\Inertia::render('DeliveryDriver/Index', [
            'orders' => $orders
        ]);
    }

    /**
     * Marca un pedido como entregado.
     */
    public function markAsDelivered(Sale $sale)
    {
        $sale->update([
            'shipping_status' => 'delivered',
            'status' => 'completed',
            'delivered_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Pedido entregado correctamente.');
    }

    /**
     * Marca un pedido como devuelto y libera inventario.
     */
    public function markAsReturned(Request $request, Sale $sale)
    {
        $request->validate([
            'return_reason' => 'required|string|max:255',
        ]);

        return DB::transaction(function () use ($sale, $request) {
            $sale->update([
                'shipping_status' => 'returned',
                'status' => 'cancelled',
                'return_reason' => $request->return_reason,
            ]);

            // Revertir inventario
            foreach ($sale->details as $detail) {
                $variant = ProductVariant::find($detail->product_variant_id);
                if ($variant) {
                    $variant->increment('stock', $detail->quantity);
                    $variant->decrement('reserved', $detail->quantity);
                }
            }

            // Create notification for admins
            $admins = User::where('role', 'admin')->get();
            $notification = new OrderReturnedNotification($sale->id, $request->return_reason);
            foreach ($admins as $admin) {
                $admin->notify($notification);
            }

            return redirect()->back()->with('success', 'Pedido marcado como devuelto e inventario actualizado.');
        });
    }

    /**
     * Cancela una orden y libera el inventario reservado.
     *
     * @param  \App\Models\Sale  $sale
     * @return \Illuminate\Http\RedirectResponse
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

                return redirect()->back()->with('success', 'Pedido cancelado con éxito. El inventario ha sido liberado.');
            });
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Error al cancelar el pedido: ' . $e->getMessage()]);
        }
    }
}
