import { editFile, editFileSchema } from '@/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { IFile } from '@/types/patient';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiEdit } from 'react-icons/fi';
import { z } from 'zod';

const dataTypes = ['Lab results', 'Medical images', 'Medication history', 'Clinician notes'];

interface Props {
    patient_id: string;
    file: IFile;
    disabled?: boolean;
    reset: () => void;
}

const FileEditDialog = ({ patient_id, file, disabled = false, reset }: Props) => {
    const queryClient = useQueryClient();

    const [dialogOpen, setDialogOpen] = useState(false);

    const editFileForm = useForm<z.infer<typeof editFileSchema>>({
        resolver: zodResolver(editFileSchema),
        defaultValues: {
            patient_id,
            name: file.name,
            dataType: file.dataType,
            fileId: file._id,
        },
        reValidateMode: 'onChange',
    });

    const editFileMutation = useMutation({
        mutationFn: editFile,
        onSuccess: () => {
            reset();
            queryClient.invalidateQueries({ queryKey: [patient_id] });
            setDialogOpen(false);
        },
    });

    const onSubmit = (values: z.infer<typeof editFileSchema>) => {
        console.log(values);
        editFileMutation.mutate(values);
    };

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button
                    disabled={disabled}
                    variant={'secondary'}
                    onClick={() => {
                        editFileForm.reset();
                        editFileMutation.reset();
                        setDialogOpen(true);
                    }}>
                    <FiEdit size={20} className='ml-1' />
                </Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-md'>
                <DialogHeader>
                    <DialogTitle>Editing File</DialogTitle>
                </DialogHeader>

                <Form {...editFileForm}>
                    <form id={`editFileForm${file._id}`} onSubmit={editFileForm.handleSubmit(onSubmit)} className='space-y-4'>
                        <FormField
                            control={editFileForm.control}
                            name='name'
                            render={() => (
                                <FormItem>
                                    <Label>File Name</Label>
                                    <FormControl>
                                        <Input placeholder='' {...editFileForm.register(`name` as const)} type='text' />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={editFileForm.control}
                            name='dataType'
                            render={() => (
                                <FormItem>
                                    <Label>Data Type</Label>
                                    <FormControl>
                                        <Select
                                            defaultValue={file.dataType}
                                            onValueChange={(value) => {
                                                editFileForm.setValue(`dataType`, value);
                                            }}
                                            {...editFileForm.register(`dataType` as const)}>
                                            <SelectTrigger className={cn('w-[180px]', editFileForm.formState.errors.dataType && 'border-red-500 border-2')}>
                                                <SelectValue placeholder='Select Data Type' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {dataTypes.map((dataType) => (
                                                    <SelectItem key={dataType} value={dataType}>
                                                        {dataType}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>

                {editFileMutation.error?.message && <p className='text-red-500 text-center text-sm'>{editFileMutation.error.message}</p>}

                <DialogFooter className='sm:justify-start'>
                    <Button type='submit' form={`editFileForm${file._id}`}>
                        {editFileMutation.isPending && (
                            <svg className='animate-spin -ml-1 mr-3 h-5 w-5' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                                <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                                <path
                                    className='opacity-75'
                                    fill='currentColor'
                                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                            </svg>
                        )}
                        Update
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

export default FileEditDialog;
