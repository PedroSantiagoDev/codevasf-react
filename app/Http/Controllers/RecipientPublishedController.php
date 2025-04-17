<?php

namespace App\Http\Controllers;

use App\Models\Recipient;
use Inertia\{Inertia, Response};

class RecipientPublishedController extends Controller
{
    public function __invoke(): Response
    {
        $recipients = Recipient::with('user')->paginate(10);

        return Inertia::render('e-carta/e-carta-recipients', [
            'recipients' => $recipients,
        ]);
    }
}
