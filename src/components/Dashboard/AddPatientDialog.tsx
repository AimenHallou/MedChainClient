import { addPatientFormSchema, createPatient } from '@/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { FileData } from '@/types/file';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

const dataTypes = ['Lab results', 'Medical images', 'Medication history', 'Clinician notes'];

interface Props extends React.HTMLAttributes<HTMLButtonElement> {}

const AddPatientDialog = ({ ...rest }: Props) => {
    const queryClient = useQueryClient();

    const [addPatientDialogOpen, setAddPatientDialogOpen] = useState(false);

    const addPatientForm = useForm<z.infer<typeof addPatientFormSchema>>({
        resolver: zodResolver(addPatientFormSchema),
        defaultValues: {
            patient_id: '',
            content: [],
        },
        reValidateMode: 'onChange',
    });

    const addPatientFormContentFields = useFieldArray({
        control: addPatientForm.control,
        name: 'content',
    });

    const addPatientMutation = useMutation({
        mutationFn: createPatient,
        onSuccess: () => {
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: ['patients'] });
            queryClient.invalidateQueries({ queryKey: ['recentPatients'] });
            queryClient.invalidateQueries({ queryKey: ['patientCount'] });

            setAddPatientDialogOpen(false);
        },
    });

    const onSubmit = (values: z.infer<typeof addPatientFormSchema>) => {
        addPatientMutation.mutate(values);
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
                            addPatientForm.clearErrors('content');
                            addPatientForm.setValue('content', fileContents);
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
        <Dialog open={addPatientDialogOpen} onOpenChange={setAddPatientDialogOpen}>
            <DialogTrigger asChild>
                <Button
                    {...rest}
                    onClick={() => {
                        addPatientMutation.reset();
                        addPatientForm.reset();
                        setAddPatientDialogOpen(true);
                    }}>
                    Add Patient
                </Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-md'>
                <DialogHeader>
                    <DialogTitle>Create New Patient</DialogTitle>
                </DialogHeader>

                <Form {...addPatientForm}>
                    <form id='addPatientForm' onSubmit={addPatientForm.handleSubmit(onSubmit)} className='space-y-4'>
                        <FormField
                            control={addPatientForm.control}
                            name='patient_id'
                            render={({ field }) => (
                                <FormItem>
                                    <Label>Patient ID</Label>
                                    <FormControl>
                                        <Input placeholder='' {...field} type='text' />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={addPatientForm.control}
                            name='content'
                            render={() => (
                                <>
                                    <FormItem>
                                        <Label>Content</Label>
                                        <FormControl>
                                            <Input type='file' multiple onChange={handleFileChange} />
                                        </FormControl>
                                    </FormItem>

                                    {addPatientFormContentFields.fields.length > 0 && (
                                        <FormItem>
                                            <Label>Content Data Types</Label>
                                            <FormControl>
                                                <div className='gap-3 grid'>
                                                    {addPatientFormContentFields.fields.map((field, index) => (
                                                        <div key={field.id} className='flex justify-between gap-x-4'>
                                                            <FormItem>
                                                                <Label>File Name</Label>
                                                                <FormControl>
                                                                    <Input
                                                                        placeholder=''
                                                                        {...addPatientForm.register(`content.${index}.name` as const)}
                                                                        type='text'
                                                                    />
                                                                </FormControl>
                                                            </FormItem>

                                                            <FormItem>
                                                                <Label>Data Type</Label>
                                                                <FormControl>
                                                                    <Select
                                                                        onValueChange={(value) => {
                                                                            addPatientForm.setValue(`content.${index}.dataType`, value);
                                                                        }}
                                                                        {...addPatientForm.register(`content.${index}.dataType` as const)}>
                                                                        <SelectTrigger
                                                                            className={cn(
                                                                                'w-[180px]',
                                                                                addPatientForm.formState.errors.content?.[index]?.dataType &&
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

                {addPatientMutation.error?.message && <p className='text-red-500 text-center text-sm'>{addPatientMutation.error.message}</p>}

                <DialogFooter className='sm:justify-start'>
                    <Button type='submit' form='addPatientForm'>
                        {addPatientMutation.isPending && (
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
                                setAddPatientDialogOpen(false);
                            }}>
                            Close
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddPatientDialog;
