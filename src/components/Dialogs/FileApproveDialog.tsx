import { shareFiles, shareFilesFormSchema } from '@/api';
import { columns } from '@/components/FileTable/columns';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { IFile } from '@/types/patient';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { DataTable } from '../DataTable';
import { Form } from '../ui/form';

interface Props {
    files: IFile[];
    patient_id: string;
    username: string;
    disabled?: boolean;
    reset: () => void;
}

const FileApproveDialog = ({ files, patient_id, username, disabled = false, reset }: Props) => {
    const queryClient = useQueryClient();

    const [dialogOpen, setDialogOpen] = useState(false);

    const [rowSelection, setRowSelection] = useState({});

    const table = useReactTable({
        data: files,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onRowSelectionChange: setRowSelection,
        state: {
            rowSelection,
        },
    });

    const selectedFiles: IFile[] = useMemo(() => {
        if (Object.keys(rowSelection).length === 0) return [];

        const f: IFile[] = [];

        for (const key in rowSelection) {
            if (files[parseInt(key)]) {
                f.push(files[parseInt(key)]);
            }
        }

        return f;
    }, [rowSelection, files]);

    const shareFilesForm = useForm<z.infer<typeof shareFilesFormSchema>>({
        resolver: zodResolver(shareFilesFormSchema),
        defaultValues: {
            patient_id,
            fileIds: [],
            username,
        },
        reValidateMode: 'onChange',
    });

    const shareFilesMutation = useMutation({
        mutationFn: shareFiles,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [patient_id] });
            reset();
            setDialogOpen(false);
        },
    });

    const onSubmit = (values: z.infer<typeof shareFilesFormSchema>) => {
        values.username = username;
        values.fileIds = selectedFiles.map((file) => file._id!);
        shareFilesMutation.mutate(values);
    };

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button
                    disabled={disabled}
                    className='bg-sky-500 hover:bg-sky-600 h-8 w-fit'
                    onClick={() => {
                        shareFilesForm.reset();
                        shareFilesMutation.reset();
                        setDialogOpen(true);
                    }}>
                    Approve
                </Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-lg'>
                <DialogHeader>
                    <DialogTitle>Approve Request</DialogTitle>
                    <DialogDescription>Select the files you want to share with {username}</DialogDescription>
                </DialogHeader>
                <DataTable table={table} />
                <Form {...shareFilesForm}>
                    <form id='shareFilesForm' onSubmit={shareFilesForm.handleSubmit(onSubmit)} className='hidden'></form>
                </Form>
                {shareFilesMutation.error?.message && <p className='text-red-500 text-center text-sm'>{shareFilesMutation.error.message}</p>}
                <DialogFooter className='sm:justify-start'>
                    <Button type='submit' form='shareFilesForm' className='bg-blue-500 hover:bg-blue-600'>
                        {shareFilesMutation.isPending && (
                            <svg className='animate-spin -ml-1 mr-3 h-5 w-5' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                                <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                                <path
                                    className='opacity-75'
                                    fill='currentColor'
                                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                            </svg>
                        )}
                        Share
                    </Button>

                    <DialogClose asChild>
                        <Button
                            type='button'
                            variant='secondary'
                            onClick={() => {
                                setDialogOpen(false);
                            }}>
                            Close
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default FileApproveDialog;
