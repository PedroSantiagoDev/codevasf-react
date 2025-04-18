<?php

namespace App\Http\Controllers;

use App\Models\Recipient;
use Illuminate\Http\Request;
use Inertia\{Inertia, Response};

class RecipientPublishedController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $perPage = $request->input('per_page', 10);

        $recipients = Recipient::with('user')->paginate($perPage);

        return Inertia::render('e-carta/e-carta-recipients', [
            'recipients' => $recipients,
        ]);
    }
}
