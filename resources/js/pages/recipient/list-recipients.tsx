'use client';

import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ColumnDef, Row } from '@tanstack/react-table';
import { Loader2, MoreHorizontal } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Destinatários',
        href: '/recipients',
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
};

export const columns: ColumnDef<Recipients>[] = [
    {
        accessorKey: 'name',
        header: 'Nome',
    },
    {
        accessorKey: 'postal_code',
        header: 'CEP',
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
    {
        id: 'actions',
        header: 'Ações',
        enableHiding: false,
        cell: ({ row }) => <ActionsCell row={row} />,
    },
];

interface ActionsCellProps {
    row: Row<Recipients>;
}

function ActionsCell({ row }: ActionsCellProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(route('recipients.destroy', row.original), {
            onSuccess: () => {
                setIsDeleting(false);
            },
            onError: () => {
                toast.error('Erro ao deletar o destinatário.');
                setIsDeleting(false);
            },
        });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Abrir menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <a href={route('recipients.edit', row.original)}>
                    <DropdownMenuItem>Editar</DropdownMenuItem>
                </a>
                <DropdownMenuItem onClick={handleDelete} disabled={isDeleting}>
                    {isDeleting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Deletando...
                        </>
                    ) : (
                        'Deletar'
                    )}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default function ListRecipients({
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
    const { props } = usePage();

    useEffect(() => {
        if (props.flash?.success) {
            toast.success(props.flash.success);
        }
        if (props.flash?.error) {
            toast.error(props.flash.error);
        }
    }, [props.flash]);

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
            <Head title="Destinatários" />
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
