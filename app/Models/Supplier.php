<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    protected $fillable = [
        'name',
        'nit',
        'phone',
        'email',
        'address',
        'contact_info',
    ];

    public function purchaseEntries()
    {
        return $this->hasMany(PurchaseEntry::class);
    }
}
