import { shareFiles, shareFilesFormSchema } from '@/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { IFile } from '@/types/patient';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { IoMdShareAlt } from 'react-icons/io';
import { z } from 'zod';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Form, FormControl, FormField, FormItem, FormMessage } from '../ui/form';
import { Label } from '@radix-ui/react-dropdown-menu';
import { Input } from '../ui/input';

interface Props {
    patient_id: string;
    files: IFile[];
    disabled: boolean;
    reset: () => void;
}

const FileShareDialog = ({ patient_id, files, disabled = false, reset }: Props) => {
    const queryClient = useQueryClient();

    const [dialogOpen, setDialogOpen] = useState(false);

    const shareFilesForm = useForm<z.infer<typeof shareFilesFormSchema>>({
        resolver: zodResolver(shareFilesFormSchema),
        defaultValues: {
            patient_id,
            fileIds: files.map((file) => file._id),
            username: '',
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
        values.fileIds = files.map((file) => file._id!);
        shareFilesMutation.mutate(values);
    };

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button
                    disabled={disabled}
                    className='bg-blue-500 hover:bg-blue-600'
                    onClick={() => {
                        shareFilesForm.reset();
                        shareFilesMutation.reset();
                        setDialogOpen(true);
                    }}>
                    Share <IoMdShareAlt size={20} className='ml-1' />
                </Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-lg'>
                <DialogHeader>
                    <DialogTitle>Share Files</DialogTitle>
                    <DialogDescription>Enter username of the recipient to share the selected files with.</DialogDescription>
                </DialogHeader>

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

                <Form {...shareFilesForm}>
                    <form id='shareFilesForm' onSubmit={shareFilesForm.handleSubmit(onSubmit)} className='space-y-4' autoComplete='off'>
                        <FormField
                            control={shareFilesForm.control}
                            name='username'
                            render={({ field }) => (
                                <FormItem>
                                    <Label>Username</Label>
                                    <FormControl>
                                        <Input placeholder='Username of user to share with' {...field} type='text' autoComplete='off' autoCapitalize='off' />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </form>
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

export default FileShareDialog;
