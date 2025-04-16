<?php

namespace App\Http\Controllers;

use App\Enums\FinishTypeEnum;
use App\Http\Requests\Recipient\RecipientRequest;
use App\Models\Recipient;
use Illuminate\Support\Facades\Storage;
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
        return Inertia::render('recipient/recipient-form');
    }

    public function store(RecipientRequest $request)
    {
        $validated = $request->validated();

        $pdfData = $this->processPdfFile($validated['file']);

        Recipient::create([
            'name' => $validated['name'],
            'street' => $validated['street'],
            'number' => $validated['number'],
            'complement' => $validated['complement'],
            'neighborhood' => $validated['neighborhood'],
            'city' => $validated['city'],
            'state' => $validated['state'],
            'postal_code' => $validated['postal_code'],
            'file_path' => $pdfData['file_path'],
            'file_size' => $pdfData['file_size'],
            'file_pages' => $pdfData['file_pages'],
            'finish_type' => $pdfData['finish_type'],
            'user_id' => auth()->user()->id,
        ]);

        return redirect()->route('recipients.index')->with('success', 'Destinatário criado com sucesso.');
    }

    public function edit(Recipient $recipient): Response
    {
        return Inertia::render('recipient/recipient-form', [
            'recipient' => $recipient,
        ]);
    }

    public function update(RecipientRequest $request, Recipient $recipient)
    {
        $validated = $request->validated();

        if ($request->hasFile('file')) {
            if ($recipient->file_path) {
                Storage::disk('public')->delete($recipient->file_path);
            }

            $pdfData = $this->processPdfFile($validated['file']);

            $recipient->update([
                'name' => $validated['name'],
                'street' => $validated['street'],
                'number' => $validated['number'],
                'complement' => $validated['complement'],
                'neighborhood' => $validated['neighborhood'],
                'city' => $validated['city'],
                'state' => $validated['state'],
                'postal_code' => $validated['postal_code'],
                'file_path' => $pdfData['file_path'],
                'file_size' => $pdfData['file_size'],
                'file_pages' => $pdfData['file_pages'],
                'finish_type' => $pdfData['finish_type'],
            ]);
        } else {
            $recipient->update([
                'name' => $validated['name'],
                'street' => $validated['street'],
                'number' => $validated['number'],
                'complement' => $validated['complement'],
                'neighborhood' => $validated['neighborhood'],
                'city' => $validated['city'],
                'state' => $validated['state'],
                'postal_code' => $validated['postal_code'],
            ]);
        }

        return redirect()->route('recipients.index')->with('success', 'Destinatário atualizado com sucesso.');
    }

    public function destroy(Recipient $recipient)
    {
        try {
            if ($recipient->file_path && Storage::disk('public')->exists($recipient->file_path)) {
                Storage::disk('public')->delete($recipient->file_path);
            }

            $recipient->delete();

            return redirect()->route('recipients.index')->with('success', 'Destinatário deletado.');
        } catch (\Exception $e) {
            return redirect()->route('recipients.index')->with('error', 'Erro ao deletar o destinatário: ' . $e->getMessage());
        }
    }

    private function processPdfFile($file): array
    {
        $uniqueName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('files', $uniqueName, 'public');
        $fullPath = storage_path('app/public/' . $path);
        $pages = $this->parserPdf($fullPath);
        $size = $file->getSize();

        $finishType = $pages <= 5
            ? FinishTypeEnum::SELFENVELOPMENT->value
            : FinishTypeEnum::INSERTION->value;

        return [
            'file_path' => $path,
            'file_size' => $size,
            'file_pages' => $pages,
            'finish_type' => $finishType,
        ];
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
