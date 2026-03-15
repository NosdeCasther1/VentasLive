<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CancelledLiveItem extends Model
{
    protected $fillable = [
        'sale_id',
        'product_variant_id',
        'quantity',
        'original_selling_price',
        'cancelled_at'
    ];

    public function productVariant()
    {
        return $this->belongsTo(ProductVariant::class);
    }
}
