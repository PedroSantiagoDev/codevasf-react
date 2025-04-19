'use client';

import type React from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { FileText, Search, Upload } from 'lucide-react';
import { type FormEventHandler, useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

type RecipientForm = {
    name: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    postal_code: string;
    file: File | null;
};

const schema = z.object({
    name: z.string().min(1, 'Nome é obrigatório').max(250, 'Nome deve ter no máximo 250 caracteres'),
    postal_code: z.string().length(8, 'CEP deve ter 8 dígitos'),
    street: z.string().min(1, 'Endereço é obrigatório').max(226, 'Endereço deve ter no máximo 226 caracteres'),
    number: z.string().max(36, 'Número deve ter no máximo 36 caracteres').optional(),
    complement: z.string().max(36, 'Complemento deve ter no máximo 36 caracteres').optional(),
    neighborhood: z.string().max(72, 'Bairro deve ter no máximo 72 caracteres').optional(),
    city: z.string().min(1, 'Cidade é obrigatória').max(72, 'Cidade deve ter no máximo 72 caracteres'),
    state: z.string().length(2, 'Estado deve ter 2 letras'),
    file: z
        .union([z.instanceof(File), z.null()])
        .refine((file) => file === null || file?.type === 'application/pdf', 'Arquivo deve ser PDF')
        .optional(),
});

export default function RecipientForm({ recipient }: { recipient?: RecipientForm }) {
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [fileName, setFileName] = useState<string>('');

    const isEdit = !!recipient;
    const title = isEdit ? 'Editar Destinatário' : 'Criar Destinatário';
    const actionText = isEdit ? 'Atualizar' : 'Cadastrar';

    const { data, setData, processing, errors, reset } = useForm<Required<RecipientForm>>({
        name: recipient?.name || '',
        street: recipient?.street || '',
        number: recipient?.number || '',
        complement: recipient?.complement || '',
        neighborhood: recipient?.neighborhood || '',
        city: recipient?.city || '',
        state: recipient?.state || '',
        postal_code: recipient?.postal_code || '',
        file: null,
    });

    const handleSearchCep = async () => {
        if (data.postal_code.length !== 8) {
            toast.error('Formato inválido', {
                description: 'CEP deve ter 8 dígitos',
            });
            return;
        }

        try {
            const response = await fetch(`https://viacep.com.br/ws/${data.postal_code}/json/`);
            const addressData = await response.json();

            if (addressData.erro) {
                setData({
                    ...data,
                    street: '',
                    neighborhood: '',
                    city: '',
                    state: '',
                });
                toast.error('CEP não encontrado', {
                    description: 'Verifique o CEP informado e tente novamente',
                });
            } else {
                setData({
                    ...data,
                    street: addressData.logradouro,
                    neighborhood: addressData.bairro,
                    city: addressData.localidade,
                    state: addressData.uf,
                });
                toast.success('CEP encontrado', {
                    description: 'Endereço preenchido automaticamente',
                });
            }
        } catch (error) {
            toast.error('Erro ao buscar CEP', {
                description: 'Ocorreu um erro ao buscar o CEP. Tente novamente mais tarde.',
            });
            console.error(error);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null;
        setData('file', file);
        setFileName(file ? file.name : '');
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const result = schema.safeParse(data);

        if (!result.success) {
            const fieldErrors = result.error.flatten().fieldErrors;
            setValidationErrors(
                Object.entries(fieldErrors).reduce(
                    (acc, [key, value]) => {
                        acc[key] = Array.isArray(value) ? value[0] : '';
                        return acc;
                    },
                    {} as Record<string, string>,
                ),
            );
            toast.error('Erro de validação', {
                description: 'Verifique os campos destacados e tente novamente',
            });
            return;
        }

        if (isEdit) {
            router.post(
                route('recipients.update', recipient),
                {
                    ...data,
                    _method: 'put',
                },
                {
                    onSuccess: () => {
                        toast.success('Destinatário atualizado com sucesso!', {
                            description: 'As alterações foram salvas',
                        });
                    },
                    onError: (errors) => {
                        toast.error('Erro ao atualizar destinatário', {
                            description: 'Verifique os campos e tente novamente',
                        });
                        setValidationErrors(errors);
                    },
                },
            );
        } else {
            router.post(route('recipients.store'), data, {
                onSuccess: () => {
                    reset('street', 'number', 'complement', 'neighborhood', 'city', 'state', 'postal_code', 'file');
                    setFileName('');
                    toast.success('Destinatário criado com sucesso!', {
                        description: 'O destinatário foi cadastrado no sistema',
                    });
                },
                onError: (errors) => {
                    toast.error('Erro ao criar destinatário', {
                        description: 'Verifique os campos e tente novamente',
                    });
                    setValidationErrors(errors);
                },
            });
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Destinatários',
            href: '/recipients',
        },
        {
            title: isEdit ? 'Editar' : 'Criar',
            href: '/recipients',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />
            <div className="p-6">
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">{isEdit ? 'Editar Destinatário' : 'Criar Destinatário'}</CardTitle>
                        <CardDescription>
                            {isEdit
                                ? 'Preencha os dados do destinatário para atualizar'
                                : 'Preencha os dados do destinatário para cadastrá-lo no sistema'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} encType="multipart/form-data" id="recipientForm" className="space-y-4">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-sm font-medium">
                                        Nome
                                    </Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                        autoFocus
                                        maxLength={250}
                                        className="w-full transition-all focus-visible:ring-2 focus-visible:ring-offset-1"
                                        placeholder="Nome completo do destinatário"
                                    />
                                    {validationErrors.name && <div className="text-sm font-medium text-red-500">{validationErrors.name}</div>}
                                    <InputError message={errors.name} className="mt-1" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="postal_code" className="text-sm font-medium">
                                        CEP
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="postal_code"
                                            type="text"
                                            value={data.postal_code}
                                            onChange={(e) => setData('postal_code', e.target.value)}
                                            required
                                            className="w-36 transition-all focus-visible:ring-2 focus-visible:ring-offset-1"
                                            maxLength={8}
                                            placeholder="00000000"
                                        />
                                        <Button type="button" onClick={handleSearchCep} size="icon">
                                            <Search className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    {validationErrors.postal_code && (
                                        <div className="text-sm font-medium text-red-500">{validationErrors.postal_code}</div>
                                    )}
                                    <InputError message={errors.postal_code} className="mt-1" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="street" className="text-sm font-medium">
                                        Endereço
                                    </Label>
                                    <Input
                                        id="street"
                                        type="text"
                                        value={data.street}
                                        onChange={(e) => setData('street', e.target.value)}
                                        required
                                        maxLength={226}
                                        className="w-full transition-all focus-visible:ring-2 focus-visible:ring-offset-1"
                                        placeholder="Rua, Avenida, etc."
                                    />
                                    {validationErrors.street && <div className="text-sm font-medium text-red-500">{validationErrors.street}</div>}
                                    <InputError message={errors.street} className="mt-1" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="number" className="text-sm font-medium">
                                        Número
                                    </Label>
                                    <Input
                                        id="number"
                                        type="text"
                                        value={data.number}
                                        onChange={(e) => setData('number', e.target.value)}
                                        maxLength={36}
                                        className="w-full transition-all focus-visible:ring-2 focus-visible:ring-offset-1"
                                        placeholder="Número"
                                    />
                                    {validationErrors.number && <div className="text-sm font-medium text-red-500">{validationErrors.number}</div>}
                                    <InputError message={errors.number} className="mt-1" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="complement" className="text-sm font-medium">
                                        Complemento
                                    </Label>
                                    <Input
                                        id="complement"
                                        type="text"
                                        value={data.complement}
                                        onChange={(e) => setData('complement', e.target.value)}
                                        maxLength={36}
                                        className="w-full transition-all focus-visible:ring-2 focus-visible:ring-offset-1"
                                        placeholder="Apto, Bloco, etc."
                                    />
                                    {validationErrors.complement && (
                                        <div className="text-sm font-medium text-red-500">{validationErrors.complement}</div>
                                    )}
                                    <InputError message={errors.complement} className="mt-1" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="neighborhood" className="text-sm font-medium">
                                        Bairro
                                    </Label>
                                    <Input
                                        id="neighborhood"
                                        type="text"
                                        value={data.neighborhood}
                                        onChange={(e) => setData('neighborhood', e.target.value)}
                                        maxLength={72}
                                        className="w-full transition-all focus-visible:ring-2 focus-visible:ring-offset-1"
                                        placeholder="Bairro"
                                    />
                                    {validationErrors.neighborhood && (
                                        <div className="text-sm font-medium text-red-500">{validationErrors.neighborhood}</div>
                                    )}
                                    <InputError message={errors.neighborhood} className="mt-1" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="city" className="text-sm font-medium">
                                        Cidade
                                    </Label>
                                    <Input
                                        id="city"
                                        type="text"
                                        value={data.city}
                                        onChange={(e) => setData('city', e.target.value)}
                                        required
                                        maxLength={72}
                                        className="w-full transition-all focus-visible:ring-2 focus-visible:ring-offset-1"
                                        placeholder="Cidade"
                                    />
                                    {validationErrors.city && <div className="text-sm font-medium text-red-500">{validationErrors.city}</div>}
                                    <InputError message={errors.city} className="mt-1" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="state" className="text-sm font-medium">
                                        Estado
                                    </Label>
                                    <Input
                                        id="state"
                                        type="text"
                                        value={data.state}
                                        onChange={(e) => setData('state', e.target.value)}
                                        required
                                        className="w-24 uppercase transition-all focus-visible:ring-2 focus-visible:ring-offset-1"
                                        maxLength={2}
                                        placeholder="UF"
                                    />
                                    {validationErrors.state && <div className="text-sm font-medium text-red-500">{validationErrors.state}</div>}
                                    <InputError message={errors.state} className="mt-1" />
                                </div>

                                <div className="col-span-full space-y-2">
                                    <Label htmlFor="file" className="text-sm font-medium">
                                        Documento (PDF)
                                    </Label>
                                    <div className="relative">
                                        <div className="border-input bg-background group relative flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4">
                                            <input
                                                id="file"
                                                type="file"
                                                onChange={handleFileChange}
                                                accept="application/pdf"
                                                required={!isEdit}
                                                className="absolute inset-0 cursor-pointer opacity-0"
                                            />
                                            <div className="flex flex-col items-center justify-center gap-2 text-center">
                                                {fileName ? (
                                                    <>
                                                        <FileText className="h-10 w-10" />
                                                        <div>
                                                            <p className="text-sm font-medium">{fileName}</p>
                                                            <p className="text-xs">Clique para trocar o arquivo</p>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload className="h-10 w-10" />
                                                        <div>
                                                            <p className="text-sm font-medium">Clique para selecionar um arquivo PDF</p>
                                                            <p className="text-xs">PDF (máx. 100MB)</p>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {validationErrors.file && <div className="text-sm font-medium text-red-500">{validationErrors.file}</div>}
                                    <InputError message={errors.file} className="mt-1" />
                                </div>
                            </div>
                        </form>

                        <div className="mt-3 flex justify-end gap-2">
                            <Button className="text-base font-medium" form="recipientForm" disabled={processing}>
                                {processing ? 'Enviando...' : actionText}
                            </Button>
                            <a href={route('recipients.index')}>
                                <Button className="text-base font-medium" variant="outline">
                                    Cancelar
                                </Button>
                            </a>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
