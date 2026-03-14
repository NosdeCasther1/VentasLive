<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $cat1 = \App\Models\Category::create(['name' => 'Ropa', 'description' => 'Prendas de vestir']);
        $cat2 = \App\Models\Category::create(['name' => 'Maquillaje', 'description' => 'Cosméticos y belleza']);

        \App\Models\Product::create([
            'sku' => '101',
            'name' => 'Blusa Campesina Floral',
            'description' => 'Blusa fresca con estampado floral',
            'price' => 125.00,
            'stock' => 15,
            'reserved' => 3,
            'category_id' => $cat1->id,
        ]);

        \App\Models\Product::create([
            'sku' => '102',
            'name' => 'Paleta de Sombras Morphe',
            'description' => 'Paleta de 35 colores vibrantes',
            'price' => 280.00,
            'stock' => 2,
            'reserved' => 1,
            'category_id' => $cat2->id,
        ]);
    }
}
