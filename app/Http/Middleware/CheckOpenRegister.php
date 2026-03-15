<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckOpenRegister
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $openRegister = \App\Models\CashRegister::where('user_id', auth()->id())
            ->where('status', 'open')
            ->first();

        if (!$openRegister && !$request->routeIs('cash-register.*')) {
            return redirect()->route('cash-register.index');
        }

        return $next($request);
    }
}
