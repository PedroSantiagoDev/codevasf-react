<?php

namespace App\Http\Controllers;

use App\Enums\FinishTypeEnum;
use App\Models\Recipient;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;
use Inertia\{Inertia, Response};

class RecipientPublishedController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $perPage = $request->input('per_page', 10);

        return Inertia::render('e-carta/e-carta-recipients', [
            'selfEnvelopment' => $this->getRecipients(FinishTypeEnum::SELFENVELOPMENT, $perPage),
            'insertion'       => $this->getRecipients(FinishTypeEnum::INSERTION, $perPage),
        ]);
    }

    /**
     * @return LengthAwarePaginator<int, \App\Models\Recipient>
     */
    private function getRecipients(FinishTypeEnum $type, int $perPage): LengthAwarePaginator
    {
        return Recipient::with('user')
            ->where('finish_type', $type->value)
            ->where('in_batch', false)
            ->paginate($perPage);
    }
}
