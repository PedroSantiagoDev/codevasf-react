<?php

use App\Http\Controllers\{RecipientController, RecipientPublishedController};
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::resource('recipients', RecipientController::class)
        ->only(['index', 'create', 'store', 'edit', 'update', 'destroy']);

    Route::get('recipients/published', RecipientPublishedController::class)->name('recipients.published');
});

require __DIR__ . '/settings.php';

require __DIR__ . '/auth.php';
