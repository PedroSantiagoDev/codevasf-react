import { DataTable } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Mail, MailOpen } from 'lucide-react';
import React from 'react';

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
        id: 'select',
        header: ({ table }) => (
            <div className="flex items-center justify-center">
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                    className="mt-[2px]" // Pequeno ajuste se ainda estiver fora do centro
                />
            </div>
        ),
        cell: ({ row }) => (
            <div className="flex items-center justify-center">
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                    className="mt-[2px]"
                />
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'user.name',
        header: () => <div className="text-center">Criador</div>,
        cell: ({ getValue }) => {
            const username = getValue();
            return <div className="text-center">{typeof username === 'string' ? username : '—'}</div>;
        },
    },
    {
        accessorKey: 'name',
        header: () => <div className="text-center">Nome</div>,
        cell: ({ row }) => <div className="text-center">{row.getValue('name')}</div>,
    },
    {
        accessorKey: 'postal_code',
        header: () => <div className="text-center">CEP</div>,
        cell: ({ row }) => {
            const cep: string = row.getValue('postal_code');
            const cepFormatted = cep.replace(/^(\d{5})(\d{3})$/, '$1-$2');
            return <div className="text-center">{cepFormatted}</div>;
        },
    },
    {
        accessorKey: 'street',
        header: () => <div className="text-center">Endereço</div>,
        cell: ({ row }) => <div className="text-center">{row.getValue('street')}</div>,
    },
    {
        accessorKey: 'number',
        header: () => <div className="text-center">Número</div>,
        cell: ({ row }) => <div className="text-center">{row.getValue('number')}</div>,
    },
    {
        accessorKey: 'complement',
        header: () => <div className="text-center">Complemento</div>,
        cell: ({ row }) => <div className="text-center">{row.getValue('complement')}</div>,
    },
    {
        accessorKey: 'neighborhood',
        header: () => <div className="text-center">Bairro</div>,
        cell: ({ row }) => <div className="text-center">{row.getValue('neighborhood')}</div>,
    },
    {
        accessorKey: 'city',
        header: () => <div className="text-center">Cidade</div>,
        cell: ({ row }) => <div className="text-center">{row.getValue('city')}</div>,
    },
    {
        accessorKey: 'state',
        header: () => <div className="text-center">Estado</div>,
        cell: ({ row }) => <div className="text-center">{row.getValue('state')}</div>,
    },
];

export default function ECartaRecipients({
    selfEnvelopment,
    insertion,
}: {
    selfEnvelopment: {
        data: Recipients[];
        current_page: number;
        last_page: number;
        prev_page_url: string | null;
        next_page_url: string | null;
        per_page: number;
        total: number;
    };
    insertion: {
        data: Recipients[];
        current_page: number;
        last_page: number;
        prev_page_url: string | null;
        next_page_url: string | null;
        per_page: number;
        total: number;
    };
}) {
    const [selectedRows, setSelectedRows] = React.useState<Recipients[]>([]);

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

    const handleSendToXml = () => {
        if (selectedRows.length > 0) {
            router.visit(route('home'), {
                method: 'get',
                data: {
                    recipient: selectedRows,
                },
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Destinatários Publicados" />
            <div className="p-4">
                <div className="flex content-center justify-between py-4">
                    <h1 className="mb-4 text-2xl font-bold">Gestão Dos Destinatários</h1>
                    <Button onClick={handleSendToXml} disabled={selectedRows.length === 0}>
                        Gerar Lote
                    </Button>
                </div>

                <Tabs defaultValue="selfEnvelopment">
                    <TabsList className="m-auto py-4">
                        <TabsTrigger value="selfEnvelopment" className="flex content-center gap-2">
                            {<MailOpen />}Auto envelopamento <Badge className="h-5 w-5">{selfEnvelopment.total}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="insertion" className="flex content-center gap-2">
                            {<Mail />}Inserção<Badge className="h-5 w-5">{insertion.total}</Badge>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="selfEnvelopment">
                        <DataTable
                            columns={columns}
                            data={selfEnvelopment.data}
                            meta={selfEnvelopment}
                            onPageChange={handlePageChance}
                            onPerPageChange={handlePerPageChange}
                            onSelectionChange={setSelectedRows}
                        />
                    </TabsContent>

                    <TabsContent value="insertion">
                        <DataTable
                            columns={columns}
                            data={insertion.data}
                            meta={insertion}
                            onPageChange={handlePageChance}
                            onPerPageChange={handlePerPageChange}
                            onSelectionChange={setSelectedRows}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
