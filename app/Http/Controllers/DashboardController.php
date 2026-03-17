<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function history()
    {
        $activities = Sale::with(['customer', 'cashRegister.user'])
            ->orderBy('created_at', 'desc')
            ->paginate(20)
            ->through(function($sale) {
                $time = $sale->created_at->format('d/m/Y H:i');
                $isDraft = $sale->status === 'live_draft';
                $icon = $isDraft ? 'ShoppingBag' : 'CheckCircle2';
                $color = $isDraft ? 'indigo' : 'emerald';
                $type = $isDraft ? 'Bolsa Apartada' : 'Venta Completada';
                
                $identifier = $sale->customer_name ?: ($sale->social_handle ? '@'.$sale->social_handle : 'Cliente General');
                $text = $isDraft 
                    ? "Nueva bolsa para $identifier" 
                    : "Venta completada: $identifier (Q " . number_format($sale->total, 2) . ")";
                
                $userName = $sale->cashRegister && $sale->cashRegister->user 
                    ? $sale->cashRegister->user->name 
                    : 'System/Admin';

                return [
                    'id' => $sale->id,
                    'text' => $text,
                    'type' => $type,
                    'time' => $time,
                    'raw_time' => $sale->created_at,
                    'icon' => $icon,
                    'color' => $color,
                    'user_name' => $userName,
                    'total' => $sale->total,
                ];
            });

        return Inertia::render('HistorialActividad', [
            'activities' => $activities
        ]);
    }
}
