<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->string('payment_method')->nullable();
            $table->decimal('amount_received', 10, 2)->nullable();
            $table->decimal('change', 10, 2)->nullable();
            $table->string('shipping_address')->nullable();
            $table->string('shipping_phone')->nullable();
            $table->decimal('shipping_cost', 10, 2)->nullable();
            $table->string('payment_status')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->dropColumn([
                'payment_method',
                'amount_received',
                'change',
                'shipping_address',
                'shipping_phone',
                'shipping_cost',
                'payment_status',
            ]);
        });
    }
};
