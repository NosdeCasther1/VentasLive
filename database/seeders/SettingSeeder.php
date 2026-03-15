<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\Setting::updateOrCreate(['key' => 'app_name'], ['value' => 'Control de Inventario']);
        \App\Models\Setting::updateOrCreate(['key' => 'company_nit'], ['value' => '1234567-8']);
        \App\Models\Setting::updateOrCreate(['key' => 'company_phone'], ['value' => '5555-5555']);
        \App\Models\Setting::updateOrCreate(['key' => 'company_address'], ['value' => 'Ciudad de Guatemala']);
        \App\Models\Setting::updateOrCreate(['key' => 'ticket_footer'], ['value' => '¡Gracias por su compra!']);
        \App\Models\Setting::updateOrCreate(['key' => 'default_shipping_cost'], ['value' => '25']);
        \App\Models\Setting::updateOrCreate(['key' => 'gemini_api_key'], ['value' => '']);
        \App\Models\Setting::updateOrCreate(['key' => 'printer_size'], ['value' => '80mm']);
    }
}
