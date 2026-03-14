<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PurchaseEntry extends Model
{
    protected $fillable = [
        'supplier_id',
        'invoice_number',
        'status',
    ];

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function details()
    {
        return $this->hasMany(PurchaseEntryDetail::class);
    }
}
