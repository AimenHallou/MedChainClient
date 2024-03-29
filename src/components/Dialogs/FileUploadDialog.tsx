import { addFiles, addFilesFormSchema, addPatientFormSchema } from '@/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { FileData } from '@/types/file';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { RiFileAddLine } from 'react-icons/ri';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

const dataTypes = ['Lab results', 'Medical images', 'Medication history', 'Clinician notes'];

interface Props {
    patient_id: string;
}

const FileUploadDialog = ({ patient_id }: Props) => {
    const queryClient = useQueryClient();

    const [dialogOpen, setDialogOpen] = useState(false);

    const addFilesForm = useForm<z.infer<typeof addFilesFormSchema>>({
        resolver: zodResolver(addFilesFormSchema),
        defaultValues: {
            patient_id,
            content: [],
        },
        reValidateMode: 'onChange',
    });

    const addFilesFormContentFields = useFieldArray({
        control: addFilesForm.control,
        name: 'content',
    });

    const addFilesMutation = useMutation({
        mutationFn: addFiles,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [patient_id] });
            setDialogOpen(false);
        },
    });

    const onSubmit = (values: z.infer<typeof addPatientFormSchema>) => {
        addFilesMutation.mutate(values);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const files = Array.from(event.target.files);
            const fileContents: FileData[] = [];

            files.forEach((file) => {
                const reader = new FileReader();
                const ipfsCID = uuidv4();

                reader.onloadend = () => {
                    if (typeof reader.result === 'string') {
                        const base64String = reader.result.split(',')[1];
                        fileContents.push({
                            base64: base64String,
                            name: file.name,
                            dataType: '',
                            ipfsCID: ipfsCID,
                        });
                        if (fileContents.length === files.length) {
                            addFilesForm.clearErrors('content');
                            addFilesForm.setValue('content', fileContents);
                        }
                    } else {
                        console.error('Unexpected result type from FileReader');
                    }
                };
                reader.readAsDataURL(file);
            });
        }
    };

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button
                    onClick={() => {
                        addFilesForm.reset();
                        addFilesMutation.reset();
                        setDialogOpen(true);
                    }}>
                    Add Files
                    <RiFileAddLine size={20} className='ml-1' />
                </Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-md'>
                <DialogHeader>
                    <DialogTitle>Upload Files for {patient_id}</DialogTitle>
                </DialogHeader>

                <Form {...addFilesForm}>
                    <form id='addFilesForm' onSubmit={addFilesForm.handleSubmit(onSubmit)} className='space-y-4'>
                        <FormField
                            control={addFilesForm.control}
                            name='content'
                            render={() => (
                                <>
                                    <FormItem>
                                        <Label>Content</Label>
                                        <FormControl>
                                            <Input type='file' multiple onChange={handleFileChange} size={500} />
                                        </FormControl>
                                    </FormItem>

                                    {addFilesFormContentFields.fields.length > 0 && (
                                        <FormItem>
                                            <Label>Content Data Types</Label>
                                            <FormControl>
                                                <div className='gap-3 grid'>
                                                    {addFilesFormContentFields.fields.map((field, index) => (
                                                        <div key={field.id} className='flex justify-between gap-x-4'>
                                                            <FormItem>
                                                                <Label>File Name</Label>
                                                                <FormControl>
                                                                    <Input
                                                                        placeholder=''
                                                                        {...addFilesForm.register(`content.${index}.name` as const)}
                                                                        type='text'
                                                                    />
                                                                </FormControl>
                                                            </FormItem>

                                                            <FormItem>
                                                                <Label>Data Type</Label>
                                                                <FormControl>
                                                                    <Select
                                                                        onValueChange={(value) => {
                                                                            addFilesForm.setValue(`content.${index}.dataType`, value);
                                                                        }}
                                                                        {...addFilesForm.register(`content.${index}.dataType` as const)}>
                                                                        <SelectTrigger
                                                                            className={cn(
                                                                                'w-[180px]',
                                                                                addFilesForm.formState.errors.content?.[index]?.dataType &&
                                                                                    'border-red-500 border-2'
                                                                            )}>
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
                                                        </div>
                                                    ))}
                                                </div>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                </>
                            )}
                        />
                    </form>
                </Form>

                {addFilesMutation.error?.message && <p className='text-red-500 text-center text-sm'>{addFilesMutation.error.message}</p>}

                <DialogFooter className='sm:justify-start'>
                    <Button type='submit' form='addFilesForm'>
                        {addFilesMutation.isPending && (
                            <svg className='animate-spin -ml-1 mr-3 h-5 w-5' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                                <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                                <path
                                    className='opacity-75'
                                    fill='currentColor'
                                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                            </svg>
                        )}
                        Submit
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

export default FileUploadDialog;
