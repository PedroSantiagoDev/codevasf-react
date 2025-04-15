<?php

namespace App\Http\Controllers;

use App\Enums\FinishTypeEnum;
use App\Http\Requests\StoreRecipientRequest;
use App\Http\Requests\UpdateRecipientRequest;
use App\Models\Recipient;
use Inertia\Inertia;
use Inertia\Response;
use Smalot\PdfParser\Parser;

class RecipientController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('recipient/list-recipients', [
            'recipients' => auth()->user()->recipients,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('recipient/create-recipient');
    }

    public function store(StoreRecipientRequest $request)
    {
        $validated = $request->validated();

        $file = $validated['file'];
        $uniqueName = time().'_'.uniqid().'.'.$file->getClientOriginalExtension();
        $path = $file->storeAs('files', $uniqueName, 'public');
        $fullPath = storage_path('app/public/'.$path);
        $pages = $this->parserPdf($fullPath);
        $size = $file->getSize();

        $finishType = $pages <= 5
            ? FinishTypeEnum::SELFENVELOPMENT->value
            : FinishTypeEnum::INSERTION->value;

        Recipient::create([
            'name' => $validated['name'],
            'street' => $validated['street'],
            'number' => $validated['number'],
            'complement' => $validated['complement'],
            'neighborhood' => $validated['neighborhood'],
            'city' => $validated['city'],
            'state' => $validated['state'],
            'postal_code' => $validated['postal_code'],
            'file_name' => $uniqueName,
            'file_path' => $path,
            'file_size' => $size,
            'file_pages' => $pages,
            'finish_type' => $finishType,
            'user_id' => auth()->user()->id,
        ]);

        return redirect()->route('recipients.index')->with('Destinatário criado com sucesso.');
    }

    public function show(Recipient $recipient)
    {
        //
    }

    public function edit(Recipient $recipient)
    {
        //
    }

    public function update(UpdateRecipientRequest $request, Recipient $recipient)
    {
        //
    }

    public function destroy(Recipient $recipient)
    {
        //
    }

    private function parserPdf(string $filepath): ?int
    {
        if (file_exists($filepath)) {
            $parser = new Parser;
            $pdf = $parser->parseFile($filepath);

            return count($pdf->getPages());
        }

        return null;
    }
}
