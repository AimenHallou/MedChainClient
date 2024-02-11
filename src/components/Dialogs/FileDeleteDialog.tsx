import { deleteFiles, deleteFilesFormSchema } from '@/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { IFile } from '@/types/patient';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { MdDeleteOutline } from 'react-icons/md';
import { z } from 'zod';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

interface Props {
    patient_id: string;
    files: IFile[];
    reset: () => void;
    disabled: boolean;
}

const FileDeleteDialog = ({ patient_id, files, reset, disabled = false }: Props) => {
    const queryClient = useQueryClient();

    const [dialogOpen, setDialogOpen] = useState(false);

    const deleteFilesForm = useForm<z.infer<typeof deleteFilesFormSchema>>({
        resolver: zodResolver(deleteFilesFormSchema),
        defaultValues: {
            patient_id,
            fileIds: files.map((file) => file._id),
        },
        reValidateMode: 'onChange',
    });

    const deleteFilesMutation = useMutation({
        mutationFn: deleteFiles,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [patient_id] });
            reset();
            setDialogOpen(false);
        },
    });

    const onSubmit = (values: z.infer<typeof deleteFilesFormSchema>) => {
        deleteFilesMutation.mutate(values);
    };

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button
                    disabled={disabled}
                    variant='destructive'
                    onClick={() => {
                        deleteFilesForm.reset();
                        deleteFilesMutation.reset();
                        setDialogOpen(true);
                    }}>
                    Delete <MdDeleteOutline size={20} className='ml-1' />
                </Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-lg'>
                <DialogHeader>
                    <DialogTitle>Are you sure you want to delete?</DialogTitle>
                    <DialogDescription className='text-destructive'>
                        This action <strong>cannot</strong> be reversed.
                    </DialogDescription>
                </DialogHeader>

                <form id='deleteFilesForm' onSubmit={deleteFilesForm.handleSubmit(onSubmit)} className='hidden'></form>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Data Type</TableHead>
                            <TableHead>ID</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {files.map((file) => (
                            <TableRow key={file._id}>
                                <TableCell className='font-medium'>{file.name}</TableCell>
                                <TableCell>{file.dataType}</TableCell>
                                <TableCell>{file._id}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {deleteFilesMutation.error?.message && <p className='text-red-500 text-center text-sm'>{deleteFilesMutation.error.message}</p>}

                <DialogFooter className='sm:justify-start'>
                    <Button type='submit' form='deleteFilesForm' variant={'destructive'}>
                        {deleteFilesMutation.isPending && (
                            <svg className='animate-spin -ml-1 mr-3 h-5 w-5' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                                <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                                <path
                                    className='opacity-75'
                                    fill='currentColor'
                                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                            </svg>
                        )}
                        Delete
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

export default FileDeleteDialog;
