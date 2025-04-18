import { DataTable } from '@/components/data-table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Destinatários Publicados',
        href: '/recipients/published',
    },
];

type Recipients = {
    id: string;
    name: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    postal_code: string;
    user: {
        name: string;
    };
};

const columns: ColumnDef<Recipients>[] = [
    {
        accessorKey: 'user.name',
        header: 'Criador',
    },
    {
        accessorKey: 'name',
        header: 'Nome',
    },
    {
        accessorKey: 'postal_code',
        header: 'CEP',
        cell: ({ row }) => {
            const cep: string = row.getValue('postal_code');
            const cepFormatted = cep.replace(/^(\d{5})(\d{3})$/, '$1-$2');

            return cepFormatted;
        },
    },
    {
        accessorKey: 'street',
        header: 'Endereço',
    },
    {
        accessorKey: 'number',
        header: 'Numero',
    },
    {
        accessorKey: 'complement',
        header: 'Complemento',
    },
    {
        accessorKey: 'neighborhood',
        header: 'Bairro',
    },
    {
        accessorKey: 'city',
        header: 'Cidade',
    },
    {
        accessorKey: 'state',
        header: 'Estado',
    },
];

export default function ECartaRecipients({
    recipients,
}: {
    recipients: {
        data: Recipients[];
        current_page: number;
        last_page: number;
        prev_page_url: string | null;
        next_page_url: string | null;
        per_page: number;
        total: number;
    };
}) {
    const handlePageChance = (url: string) => {
        router.visit(url, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const handlePerPageChange = (perPage: number) => {
        const searchParams = new URLSearchParams(window.location.search);
        searchParams.set('per_page', String(perPage));
        router.visit(`${window.location.pathname}?${searchParams.toString()}`, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Destinatários Publicados" />
            <div className="p-4">
                <h1 className="mb-4 text-2xl font-bold">Lista de Destinatários</h1>
                <DataTable
                    columns={columns}
                    data={recipients.data}
                    meta={recipients}
                    onPageChange={handlePageChance}
                    onPerPageChange={handlePerPageChange}
                />
            </div>
        </AppLayout>
    );
}
