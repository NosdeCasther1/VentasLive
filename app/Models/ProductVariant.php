<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductVariant extends Model
{
    protected $fillable = [
        'product_id',
        'sku',
        'size',
        'color',
        'selling_price',
        'average_cost',
        'stock',
        'reserved',
    ];

    protected $appends = ['available_stock'];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function getAvailableStockAttribute()
    {
        return $this->stock - $this->reserved;
    }
}
