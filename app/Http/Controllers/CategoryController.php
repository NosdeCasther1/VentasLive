<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'max_discount_percent' => 'required|integer|min:0|max:100',
        ]);

        Category::create($validated);

        return redirect()->back()->with('success', 'Categoría creada correctamente.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'max_discount_percent' => 'required|integer|min:0|max:100',
        ]);

        $category->update($validated);

        return redirect()->back()->with('success', 'Categoría actualizada correctamente.');
    }

    /**
     * Remove the specified resource in storage.
     */
    public function destroy(Category $category)
    {
        // Check if there are products using this category
        if ($category->products()->count() > 0) {
            return redirect()->back()->withErrors(['category' => 'No se puede eliminar una categoría que tiene productos asociados.']);
        }

        $category->delete();

        return redirect()->back()->with('success', 'Categoría eliminada correctamente.');
    }
}
