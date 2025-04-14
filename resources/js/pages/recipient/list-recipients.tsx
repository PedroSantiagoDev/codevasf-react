'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
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
import { ArrowUpDown, MoreHorizontal, Plus } from 'lucide-react';
import React from 'react';

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

export const recipients: Recipients[] = [
    {
        id: '1',
        name: 'Pedro',
        street: 'Rua 5',
        number: 'Nº 10',
        complement: 'Quadra 94 Bloco A',
        neighborhood: 'Cidade Olímpica',
        city: 'São Luís',
        state: 'MA',
        postal_code: '44444-444',
    },
    {
        id: '1',
        name: 'A',
        street: 'Rua 5',
        number: 'Nº 10',
        complement: 'Quadra 94 Bloco A',
        neighborhood: 'Cidade Olímpica',
        city: 'São Luís',
        state: 'MA',
        postal_code: '44444-444',
    },
    {
        id: '1',
        name: 'Pedro',
        street: 'Rua 5',
        number: 'Nº 10',
        complement: 'Quadra 94 Bloco A',
        neighborhood: 'Cidade Olímpica',
        city: 'São Luís',
        state: 'MA',
        postal_code: '44444-444',
    },
];

export const columns: ColumnDef<Recipients>[] = [
    {
        accessorKey: 'name',
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Email
                    <ArrowUpDown />
                </Button>
            );
        },
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
        cell: ({ row }) => {
            const recipient = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem>Deletar</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
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

                <Button>
                    <Plus className="h-4 w-4" />
                    Adicionar
                </Button>
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
            <div className="flex items-center justify-end space-x-2 p-4">
                <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                    Anterior
                </Button>
                <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                    Proximo
                </Button>
            </div>
        </div>
    );
}

export default function ListRecipients() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Destinatários" />
            <div className="p-4">
                <h1 className="mb-4 text-2xl font-bold">Lista de Destinatários</h1>
                <DataTable columns={columns} data={recipients} />
            </div>
        </AppLayout>
    );
}
