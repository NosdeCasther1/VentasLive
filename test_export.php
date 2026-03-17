<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$request = Illuminate\Http\Request::create('/login', 'POST', [
    'email' => 'admin@gmail.com', // or gmial.com as user typed
    'password' => '12345678',
]);
$response = $kernel->handle($request);

$cookies = [];
foreach ($response->headers->getCookies() as $cookie) {
    if ($cookie->getName() === 'laravel_session' || $cookie->getName() === 'XSRF-TOKEN') {
        $cookies[$cookie->getName()] = $cookie->getValue();
}
}

$request2 = Illuminate\Http\Request::create('/reportes/exportar/pdf', 'GET');
foreach ($cookies as $name => $val) {
    $request2->cookies->set($name, $val);
}

// Ensure the user is authenticated in this request by acting as the user directly
$user = \App\Models\User::where('email', 'admin@gmail.com')->first();
if (!$user) {
    $user = \App\Models\User::where('email', 'admin@gmial.com')->first();
}

if ($user) {
    $app->make('auth')->login($user);
    $response2 = $kernel->handle($request2);
    
    // Save response details to a file for inspection
    $output = "Status: " . $response2->getStatusCode() . "\n";
    $output .= "Headers:\n" . $response2->headers . "\n";
    if (method_exists($response2, 'getFile')) {
        $output .= "File Path: " . $response2->getFile()->getPathname() . "\n";
    }
    
    file_put_contents(__DIR__ . '/test_export_response.txt', $output);
    echo "Done. Response saved to test_export_response.txt\n";
} else {
    echo "User not found\n";
}
