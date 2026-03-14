<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'full_name',
        'social_handle',
        'phone',
        'email',
        'default_address',
        'notes',
    ];

    public function sales()
    {
        return $this->hasMany(Sale::class);
    }
}
