<?php

use App\Http\Controllers\ProductController;
use App\Http\Controllers\Auth\LoginController;
use Illuminate\Support\Facades\Route;

Route::get('/login', [LoginController::class, 'showLoginForm'])->name('login');
Route::post('/login', [LoginController::class, 'login']);
Route::post('/logout', [LoginController::class, 'logout'])->name('logout');

Route::middleware(['auth'])->group(function () {
    Route::get('/pos', function () {
        return redirect('/');
    });

    Route::prefix('cash-register')->group(function () {
        Route::get('/', [\App\Http\Controllers\CashRegisterController::class, 'index'])->name('cash-register.index');
        Route::post('/', [\App\Http\Controllers\CashRegisterController::class, 'store'])->name('cash-register.store');
        Route::get('/summary', [\App\Http\Controllers\CashRegisterController::class, 'summary'])->name('cash-register.summary');
        Route::post('/close', [\App\Http\Controllers\CashRegisterController::class, 'close'])->name('cash-register.close');
        Route::get('/print/{id}', [\App\Http\Controllers\CashRegisterController::class, 'printTicket'])->name('cash-register.print');
        Route::get('/reprint/{id}', [\App\Http\Controllers\CashRegisterController::class, 'printTicket'])->name('cash-register.reprint');
    });

    Route::middleware(['check.register'])->group(function () {
        // Audit and Reports
        Route::get('products/count-sheet', [\App\Http\Controllers\ProductController::class, 'countSheet'])->name('products.count-sheet');
        Route::post('products/adjust-stock', [\App\Http\Controllers\ProductController::class, 'adjustStock'])->name('products.adjust-stock');
        Route::get('api/products/adjustments', [\App\Http\Controllers\ProductController::class, 'adjustmentHistory'])->name('api.products.adjustments');
        Route::get('suppliers/export-pdf', [\App\Http\Controllers\SupplierController::class, 'exportPdf'])->name('suppliers.export-pdf');
        Route::get('suppliers/export-excel', [\App\Http\Controllers\SupplierController::class, 'exportExcel'])->name('suppliers.export-excel');

        Route::get('/', [\App\Http\Controllers\ProductController::class, 'index'])->name('products.index');
        Route::resource('products', \App\Http\Controllers\ProductController::class)->except(['index']);
        Route::post('purchase-entries', [\App\Http\Controllers\PurchaseEntryController::class, 'store'])->name('purchase-entries.store');
        Route::resource('suppliers', \App\Http\Controllers\SupplierController::class)->except(['index', 'create', 'show', 'edit']);
        Route::post('sales', [\App\Http\Controllers\POSController::class, 'store'])->name('sales.store');
        Route::post('sales/delivery', [\App\Http\Controllers\POSController::class, 'storeDelivery'])->name('sales.storeDelivery');
        Route::resource('customers', \App\Http\Controllers\CustomerController::class)->except(['create', 'show', 'edit']);
        Route::get('api/customers/search', [\App\Http\Controllers\CustomerController::class, 'searchAPI'])->name('customers.searchAPI');
        
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
        Route::post('api/live/cancel-item', [\App\Http\Controllers\LogisticsController::class, 'cancelItemFromBag'])->name('live.cancelItem');
        Route::get('api/live/cancelled-items/{sale}', [\App\Http\Controllers\LogisticsController::class, 'getCancelledItemsForBag'])->name('live.cancelledItems');
        Route::post('api/live/cancel-bag/{sale}', [\App\Http\Controllers\LiveController::class, 'cancelBag'])->name('live.cancelBag');
        Route::post('api/live/checkout/{sale}', [\App\Http\Controllers\LiveController::class, 'checkout'])->name('live.checkout');
        Route::post('/live/process-ai', [\App\Http\Controllers\LiveController::class, 'processAI'])->name('live.processAI');
        Route::post('api/live/sessions/start', [\App\Http\Controllers\LiveController::class, 'startSession'])->name('live.sessions.start');
        Route::post('api/live/sessions/{session}/end', [\App\Http\Controllers\LiveController::class, 'endSession'])->name('live.sessions.end');

        // Drivers Routes
        Route::get('logistics/driver', [\App\Http\Controllers\LogisticsController::class, 'driverIndex'])->name('logistics.driver.index');
        Route::patch('logistics/driver/{sale}/delivered', [\App\Http\Controllers\LogisticsController::class, 'markAsDelivered'])->name('logistics.driver.delivered');
        Route::patch('logistics/driver/{sale}/returned', [\App\Http\Controllers\LogisticsController::class, 'markAsReturned'])->name('logistics.driver.returned');

        // Expenses Routes
        Route::resource('expenses', \App\Http\Controllers\ExpenseController::class)->except(['create', 'show', 'edit']);
        Route::get('api/expenses', [\App\Http\Controllers\ExpenseController::class, 'index'])->name('expenses.api.index');
    });

    // Reports and Settings
    Route::get('api/reports/metrics', [\App\Http\Controllers\ReportController::class, 'metrics'])->name('reports.metrics');
    Route::get('reports/accounting', [\App\Http\Controllers\AccountingController::class, 'index'])->name('reports.accounting');
    Route::get('api/accounting/diario', [\App\Http\Controllers\AccountingController::class, 'getDiario'])->name('api.accounting.diario');
    Route::get('api/accounting/mayor', [\App\Http\Controllers\AccountingController::class, 'getMayor'])->name('api.accounting.mayor');
    Route::get('api/accounting/estado-resultados', [\App\Http\Controllers\AccountingController::class, 'getEstadoResultados'])->name('api.accounting.estado-resultados');
    Route::get('api/accounting/export/pdf', [\App\Http\Controllers\AccountingController::class, 'exportPdf'])->name('api.accounting.export.pdf');
    Route::get('api/accounting/export/excel', [\App\Http\Controllers\AccountingController::class, 'exportExcel'])->name('api.accounting.export.excel');

    Route::get('settings', [\App\Http\Controllers\SettingController::class, 'index'])->name('settings.index');
    Route::post('settings', [\App\Http\Controllers\SettingController::class, 'update'])->name('settings.update');
    Route::resource('users', \App\Http\Controllers\UserController::class)->except(['index', 'create', 'show', 'edit']);

    // Notification Routes
    Route::post('notifications/{id}/mark-as-read', [\App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('notifications.markAsRead');
    Route::post('notifications/mark-all-as-read', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead'])->name('notifications.markAllAsRead');

    Route::get('/profile', [\App\Http\Controllers\ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [\App\Http\Controllers\ProfileController::class, 'update'])->name('profile.update');
});
