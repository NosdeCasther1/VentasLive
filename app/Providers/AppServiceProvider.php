<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        \Illuminate\Support\Facades\Gate::define('view-reports', fn($user) => $user->role === 'admin');
        \Illuminate\Support\Facades\Gate::define('manage-settings', fn($user) => $user->role === 'admin');
        \Illuminate\Support\Facades\Gate::define('adjust-inventory', fn($user) => $user->role === 'admin');
    }
}
