<?php

use App\Http\Controllers\ProductController;
use Illuminate\Support\Facades\Route;

Route::get('/', [\App\Http\Controllers\ProductController::class, 'index']);
Route::resource('products', \App\Http\Controllers\ProductController::class)->except(['index']);
Route::post('purchase-entries', [\App\Http\Controllers\PurchaseEntryController::class, 'store'])->name('purchase-entries.store');
Route::resource('suppliers', \App\Http\Controllers\SupplierController::class)->except(['index', 'create', 'show', 'edit']);
Route::post('sales', [\App\Http\Controllers\POSController::class, 'store'])->name('sales.store');
Route::post('sales/delivery', [\App\Http\Controllers\POSController::class, 'storeDelivery'])->name('sales.storeDelivery');
Route::resource('customers', \App\Http\Controllers\CustomerController::class)->except(['create', 'show', 'edit']);
Route::get('api/customers/search', [\App\Http\Controllers\CustomerController::class, 'searchAPI'])->name('customers.searchAPI');
Route::get('api/reports/metrics', [\App\Http\Controllers\ReportController::class, 'metrics'])->name('reports.metrics');

// Logistics Kanban Routes
Route::post('logistics/manual-delivery', [\App\Http\Controllers\POSController::class, 'storeManualDelivery'])->name('logistics.storeManualDelivery');
Route::patch('logistics/{sale}/update-status', [\App\Http\Controllers\POSController::class, 'updateShippingStatus'])->name('logistics.updateStatus');
Route::patch('logistics/{sale}/update-address', [\App\Http\Controllers\POSController::class, 'updateShippingAddress'])->name('logistics.updateAddress');
Route::post('logistics/{sale}/cancel', [\App\Http\Controllers\LogisticsController::class, 'cancelOrder'])->name('logistics.cancel');
Route::get('logistics/manifest', [\App\Http\Controllers\POSController::class, 'driverManifest'])->name('logistics.manifest');

// Modo Live Routes
Route::get('api/live/bags', [\App\Http\Controllers\LiveController::class, 'getBags'])->name('live.bags');
Route::post('api/live/add-item', [\App\Http\Controllers\LiveController::class, 'addItemToBag'])->name('live.addItem');
Route::post('api/live/remove-item', [\App\Http\Controllers\LiveController::class, 'removeItem'])->name('live.removeItem');
Route::post('api/live/cancel-bag/{sale}', [\App\Http\Controllers\LiveController::class, 'cancelBag'])->name('live.cancelBag');
Route::post('api/live/checkout/{sale}', [\App\Http\Controllers\LiveController::class, 'checkout'])->name('live.checkout');
Route::post('/live/process-ai', [\App\Http\Controllers\LiveController::class, 'processAI'])->name('live.processAI');
