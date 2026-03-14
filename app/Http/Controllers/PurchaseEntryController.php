<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PurchaseEntry;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\DB;

class PurchaseEntryController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'invoice_number' => 'required|string|max:255',
            'details' => 'required|array|min:1',
            'details.*.product_variant_id' => 'required|exists:product_variants,id',
            'details.*.quantity' => 'required|integer|min:1',
            'details.*.unit_cost' => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($validated) {
            $entry = PurchaseEntry::create([
                'supplier_id' => $validated['supplier_id'],
                'invoice_number' => $validated['invoice_number'],
                'status' => 'completed',
            ]);

            foreach ($validated['details'] as $detail) {
                $entry->details()->create([
                    'product_variant_id' => $detail['product_variant_id'],
                    'quantity' => $detail['quantity'],
                    'unit_cost' => $detail['unit_cost'],
                ]);

                $variant = ProductVariant::lockForUpdate()->find($detail['product_variant_id']);

                $currentStock = $variant->stock;
                $currentCost = $variant->average_cost;
                $newQuantity = $detail['quantity'];
                $newCost = $detail['unit_cost'];

                $newAverageCost = (($currentStock * $currentCost) + ($newQuantity * $newCost)) / ($currentStock + $newQuantity);

                $variant->update([
                    'stock' => $currentStock + $newQuantity,
                    'average_cost' => $newAverageCost,
                ]);
            }
        });

        return redirect()->back()->with('success', 'Compra registrada. El stock y precio medio han sido recalculados.');
    }
}
