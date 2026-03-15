<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    use HasFactory;

    protected $fillable = [
        'description',
        'amount',
        'category',
        'expense_date',
        'cash_register_id',
    ];

    public function cashRegister()
    {
        return $this->belongsTo(CashRegister::class);
    }

    protected $casts = [
        'expense_date' => 'date',
        'amount' => 'decimal:2',
    ];
}
