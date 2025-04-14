<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('recipients', function (Blueprint $table) {
            $table->id();
            $table->string('name', 250);
            $table->string('street', 226);
            $table->string('number', 36)->nullable();
            $table->string('complement', 36)->nullable();
            $table->string('neighborhood', 72)->nullable();
            $table->string('city', 72);
            $table->char('state', 2);
            $table->char('postal_code', 8);
            $table->string('file_path');
            $table->unsignedBigInteger('file_size');
            $table->integer('file_pages');
            $table->string('finish_type');
            $table->boolean('in_batch')->default(false);
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('recipients');
    }
};
