import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import React from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Destinatários Publicados',
        href: '/recipients/published',
    },
];

type Recipients = {
    id: string;
    user_name: string;
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
        accessorKey: 'user.name',
        header: 'Criador',
    },
    {
        accessorKey: 'name',
        header: 'Nome',
        // header: ({ column }) => {
        //     return (
        //         <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        //             Nome
        //             <ArrowUpDown />
        //         </Button>
        //     );
        // },
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
];

function DataTable<TData, TValue>({ columns, data }: { columns: ColumnDef<TData, TValue>[]; data: TData[] }) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
        },
    });

    return (
        <div className="w-full">
            <div className="mb-3 flex items-center justify-between">
                <Input
                    placeholder="Filtra nomes..."
                    value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
                    onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
                    className="max-w-sm"
                />
                <a href={route('recipients.create')}>
                    <Button>
                        <Plus className="h-4 w-4" />
                        Adicionar
                    </Button>
                </a>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    Nenhum resultado encontrado.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

export default function ECartaRecipients({
    recipients,
}: {
    recipients: {
        data: Recipients[];
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
    };
}) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Destinatários Publicados" />
            <div className="p-4">
                <h1 className="mb-4 text-2xl font-bold">Lista de Destinatários</h1>
                <DataTable columns={columns} data={recipients.data} />
                <div className="mt-2 flex items-center justify-end space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.visit(`?page=${recipients.current_page - 1}`)}
                        disabled={recipients.current_page === 1}
                    >
                        Anterior
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.visit(`?page=${recipients.current_page + 1}`)}
                        disabled={recipients.current_page === recipients.last_page}
                    >
                        Proximo
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
