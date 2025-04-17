<?php

namespace App\Http\Requests\Recipient;

use Illuminate\Foundation\Http\FormRequest;

class RecipientRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name'         => 'required|string|max:255',
            'postal_code'  => 'required|digits:8',
            'street'       => 'required|string|max:226',
            'number'       => 'nullable|string|max:36',
            'complement'   => 'nullable|string|max:36',
            'neighborhood' => 'nullable|string|max:72',
            'city'         => 'required|string|max:72',
            'state'        => 'required|string|size:2',
            'file'         => 'nullable|file|mimes:pdf|max:104857600', // 100mb
        ];
    }
}
