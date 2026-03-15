<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingController extends Controller
{
    public function index()
    {
        return Inertia::render('Settings/Index', [
            'settings' => Setting::all()->pluck('value', 'key'),
            'users' => User::all()
        ]);
    }

    public function update(Request $request)
    {
        $settings = $request->all();
        
        foreach ($settings as $key => $value) {
            // Only update if it's a known setting key
            \App\Models\Setting::where('key', $key)->update(['value' => $value]);
            \Illuminate\Support\Facades\Cache::forget("setting.$key");
        }
        
        return redirect()->back()->with('success', 'Configuración actualizada');
    }
}
