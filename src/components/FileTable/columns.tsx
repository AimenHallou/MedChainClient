import { ColumnDef } from '@tanstack/react-table';

import { FileData } from '@/types/file';
import { Checkbox } from '../ui/checkbox';

export const columns: ColumnDef<FileData>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label='Select all'
            />
        ),
        cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label='Select row' />,
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'name',
        header: 'Name',
    },
    {
        accessorKey: 'dataType',
        header: 'Data Type',
    },
    {
        accessorKey: 'createdAt',
        header: 'Uploaded',
    },
    // {
    //     id: 'actions',
    //     cell: ({ row }) => {
    //         const file = row.original;

    //         return (
    //             <DropdownMenu>
    //                 <DropdownMenuTrigger asChild>
    //                     <Button variant='ghost' className='h-8 w-8 p-0'>
    //                         <span className='sr-only'>Open menu</span>
    //                         <BsThreeDots />
    //                     </Button>
    //                 </DropdownMenuTrigger>
    //                 <DropdownMenuContent align='end'>
    //                     <DropdownMenuLabel>Actions</DropdownMenuLabel>
    //                     <DropdownMenuItem onClick={() => navigator.clipboard.writeText(file.name)}>Copy payment ID</DropdownMenuItem>
    //                     <DropdownMenuSeparator />
    //                     <DropdownMenuItem>View customer</DropdownMenuItem>
    //                     <DropdownMenuItem>View payment details</DropdownMenuItem>
    //                 </DropdownMenuContent>
    //             </DropdownMenu>
    //         );
    //     },
    // },
    // ...
];
