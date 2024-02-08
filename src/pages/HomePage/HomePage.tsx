import { addPatientFormSchema, createPatient, getPatientCount, getPatients } from '@/api';
import PatientCard from '@/components/PatientCard/PatientCard';
import PatientCardSkeleton from '@/components/PatientCard/PatientCardSkeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { FileData } from '@/types/file';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaUser } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import PatientSummary from './PatientSummary';
import RecentPatients from './RecentPatients';

const dataTypes = ['Lab results', 'Medical images', 'Medication history', 'Clinician notes'];

const HomePage = () => {
    const queryClient = useQueryClient();

    const [pagination, setPagination] = useState({ page: 0, limit: 15 });

    const { data, isLoading: patientIsLoading } = useQuery({
        queryKey: ['patients', pagination.page],
        queryFn: () => getPatients(pagination.page, pagination.limit),
    });

    const { data: patientCount } = useQuery({ queryKey: ['patientCount'], queryFn: getPatientCount });

    const [addPatientDialogOpen, setAddPatientDialogOpen] = useState(false);

    const addPatientForm = useForm<z.infer<typeof addPatientFormSchema>>({
        resolver: zodResolver(addPatientFormSchema),
        defaultValues: {
            patient_id: '',
            content: [],
        },
    });

    const filesData = addPatientForm.watch('content');

    const onSubmit = (values: z.infer<typeof addPatientFormSchema>) => {
        addPatientMutation.mutate(values);
    };

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

    const handleDataTypeChange = (index: number, dataType: string) => {
        console.log(filesData);

        const updatedFilesData = filesData.map((file, idx) => {
            if (idx === index) {
                return { ...file, dataType: dataType };
            }
            return file;
        });

        addPatientForm.setValue('content', updatedFilesData);
    };

    return (
        <div className='flex-grow h-full'>
            <div className='max-w-[90rem] mx-auto grid grid-cols-1 lg:grid-cols-10 gap-4 mt-8'>
                <div className='col-span-2 gap-4'>
                    <PatientSummary />

                    <RecentPatients className='mt-4' />
                </div>
                <div className='col-span-8'>
                    <Card>
                        <CardHeader>
                            <div className='flex justify-between'>
                                <div className='flex space-x-2 items-center'>
                                    <CardTitle className='text-2xl'>Patients</CardTitle>
                                    <FaUser size={18} className='hover:text-gray-400 transition-colors duration-200' />
                                </div>

                                <Dialog open={addPatientDialogOpen} onOpenChange={setAddPatientDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button
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
                                                    render={({ field }) => (
                                                        <>
                                                            <FormItem>
                                                                <Label>Content</Label>
                                                                <FormControl>
                                                                    <Input type='file' multiple onChange={handleFileChange} />
                                                                </FormControl>
                                                            </FormItem>

                                                            {field.value.length > 0 && (
                                                                <FormItem>
                                                                    <Label>Content Data Types</Label>
                                                                    <FormControl>
                                                                        <div className='gap-3 grid'>
                                                                            {field.value.map((fileData, index) => (
                                                                                <div key={fileData.name} className='flex justify-between'>
                                                                                    <p className='font-light'>{fileData.name}</p>
                                                                                    <div className='flex flex-col items-center'>
                                                                                        <Select onValueChange={(e) => handleDataTypeChange(index, e)}>
                                                                                            <SelectTrigger
                                                                                                className={cn(
                                                                                                    'w-[180px]',
                                                                                                    addPatientForm.formState.errors.content?.[index]
                                                                                                        ?.dataType && 'border-red-500 border-2'
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
                                                                                    </div>
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

                                        {addPatientMutation.error?.message && (
                                            <p className='text-red-500 text-center text-sm'>{addPatientMutation.error.message}</p>
                                        )}

                                        <DialogFooter className='sm:justify-start'>
                                            <Button type='submit' form='addPatientForm'>
                                                {addPatientMutation.isPending && (
                                                    <svg
                                                        className='animate-spin -ml-1 mr-3 h-5 w-5'
                                                        xmlns='http://www.w3.org/2000/svg'
                                                        fill='none'
                                                        viewBox='0 0 24 24'>
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
                            </div>
                        </CardHeader>
                        <CardContent className='grid gap-4'>
                            <div className='grid grid-cols-3 gap-5'>
                                {patientIsLoading && Array.from({ length: 6 }).map((_, i) => <PatientCardSkeleton key={i} />)}

                                {data?.map((patient) => {
                                    return <PatientCard key={patient.patient_id} patient={patient} />;
                                })}
                            </div>

                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            className='cursor-pointer select-none'
                                            onClick={() => {
                                                if (pagination.page > 0) {
                                                    setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
                                                }
                                            }}
                                        />
                                    </PaginationItem>
                                    {Array.from({ length: Math.ceil(patientCount! / pagination.limit) }).map((_, i) => (
                                        <PaginationItem key={i}>
                                            <PaginationLink
                                                className={cn('select-none cursor-pointer', pagination.page === i && 'bg-secondary text-white')}
                                                onClick={() => {
                                                    setPagination((prev) => ({ ...prev, page: i }));
                                                }}>
                                                {i + 1}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ))}

                                    <PaginationItem>
                                        <PaginationNext
                                            className='cursor-pointer select-none'
                                            onClick={() => {
                                                if (pagination.page < Math.floor(patientCount! / pagination.limit)) {
                                                    setPagination((prev) => ({ ...prev, page: prev.page + 1 }));
                                                }
                                            }}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
