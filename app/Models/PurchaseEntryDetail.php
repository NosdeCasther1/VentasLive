<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PurchaseEntryDetail extends Model
{
    protected $fillable = [
        'purchase_entry_id',
        'product_variant_id',
        'quantity',
        'unit_cost',
    ];

    public function purchaseEntry()
    {
        return $this->belongsTo(PurchaseEntry::class);
    }

    public function productVariant()
    {
        return $this->belongsTo(ProductVariant::class);
    }
}
