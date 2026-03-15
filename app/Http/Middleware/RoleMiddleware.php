<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        if (! $request->user() || $request->user()->role !== $role) {
            if ($request->expectsJson()) {
                return response()->json(['error' => 'No autorizado. Se requiere rol: ' . $role], 403);
            }
            abort(403, 'No autorizado.');
        }

        return $next($request);
    }
}
