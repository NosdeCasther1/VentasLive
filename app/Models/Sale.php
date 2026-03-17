<?php

namespace App\Models;

use App\Models\Customer;
use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    protected $fillable = [
        'customer_id',
        'customer_name',
        'customer_phone',
        'customer_address',
        'social_handle',
        'total',
        'discount',
        'payment_method',
        'payment_status',
        'status',
        'sale_type',
        'shipping_phone',
        'shipping_address',
        'shipping_cost',
        'shipping_status',
        'amount_received',
        'change',
        'notes',
        'cash_register_id',
        'cancelled_at'
    ];

    public function cashRegister()
    {
        return $this->belongsTo(CashRegister::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function details()
    {
        return $this->hasMany(SaleDetail::class);
    }
}
