<?php

use App\Http\Controllers\RecipientController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('recipients', [RecipientController::class, 'index'])->name('recipients.index');
    Route::get('recipients/create', [RecipientController::class, 'create'])->name('recipients.create');
    Route::post('recipients', [RecipientController::class, 'store'])->name('recipients.store');
    Route::get('recipients/{recipient}/edit', [RecipientController::class, 'edit'])->name('recipients.edit');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
