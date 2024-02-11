import { getPatient } from '@/api';
import { DataTable } from '@/components/DataTable';
import FileDeleteDialog from '@/components/Dialogs/FileDeleteDialog';
import FileShareDialog from '@/components/Dialogs/FileShareDialog';
import FileUploadDialog from '@/components/Dialogs/FileUploadDialog';
import { columns } from '@/components/FileTable/columns';
import History from '@/components/History';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { RootState } from '@/redux/store';
import { IFile } from '@/types/patient';
import { shortenAddress } from '@/utils/shortenAddress';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { BiTransfer } from 'react-icons/bi';
import { BsPersonFillLock } from 'react-icons/bs';
import { FaUser, FaUserInjured } from 'react-icons/fa';
import { LuFiles } from 'react-icons/lu';
import { VscSettings } from 'react-icons/vsc';
import { useSelector } from 'react-redux';

export const Route = createFileRoute('/patient/$patientId')({
    // Or in a component
    component: PatientComponent,
    onEnter: ({ params }) => {
        document.title = `${params.patientId} | MedChain`;
    },
});

function PatientComponent() {
    const user = useSelector((state: RootState) => state.auth.user);
    const { patientId } = Route.useParams();

    const { data, isLoading, isError, error } = useQuery({
        queryKey: [patientId],
        queryFn: () => getPatient(patientId),
    });

    const [rowSelection, setRowSelection] = useState({});
    const table = useReactTable({
        data: data?.patient.content || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        onRowSelectionChange: setRowSelection,
        state: {
            rowSelection,
        },
    });

    const isOwner = useMemo(() => {
        return data?.owner.address === user?.address;
    }, [data?.owner.address, user?.address]);

    const selectedFiles: IFile[] = useMemo(() => {
        if (Object.keys(rowSelection).length === 0) return [];

        const files = [];

        for (const key in rowSelection) {
            if (data?.patient.content[parseInt(key)]) {
                files.push(data?.patient.content[parseInt(key)]);
            }
        }

        return files;
    }, [rowSelection, data?.patient.content]);

    if (isLoading) {
        return (
            <div className='flex-grow h-full'>
                <div className='max-w-7xl mx-auto mt-10 flex justify-center'>Loading...</div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className='flex-grow h-full'>
                <div className='max-w-7xl mx-auto mt-10 flex justify-center'>{error.message}</div>
            </div>
        );
    }

    const { owner, patient } = data!;

    return (
        <div className='flex-grow h-full'>
            <div className='max-w-7xl mx-auto mt-10 flex justify-center'>
                <div className={cn('grid gap-4', !isOwner ? 'grid-cols-4' : 'grid-cols-10')}>
                    <div className={cn('flex flex-col gap-y-4', !isOwner ? 'col-span-4' : 'col-span-3')}>
                        <Card className='h-fit'>
                            <CardHeader>
                                <div className='flex space-x-2 items-center'>
                                    <CardTitle className='text-xl'>Owner Information</CardTitle>
                                    <FaUser size={20} />
                                </div>
                            </CardHeader>
                            <CardContent className='grid gap-4'>
                                <div className='flex gap-x-3'>
                                    <Badge variant='outline'>Name</Badge>
                                    <p className='text-sm'>{owner.name}</p>
                                </div>

                                <div className='flex gap-x-3'>
                                    <Badge variant='outline'>Address</Badge>
                                    <p className='text-sm'>{shortenAddress(owner.address)}</p>
                                </div>

                                <div className='flex gap-x-3'>
                                    <Badge variant='outline'>Healthcare Provider</Badge>
                                    <p className='text-sm'>{owner.healthcareType}</p>
                                </div>

                                <div className='flex gap-x-3'>
                                    <Badge variant='outline'>Organization</Badge>
                                    <p className='text-sm'>{owner.organizationName}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className='h-fit'>
                            <CardHeader>
                                <div className='flex justify-between'>
                                    <div className='flex space-x-2 items-center'>
                                        <CardTitle className='text-xl'>Patient</CardTitle>
                                        <FaUserInjured size={20} />
                                    </div>

                                    {!isOwner && <Button>Request Access</Button>}
                                </div>
                            </CardHeader>
                            <CardContent className='grid gap-4'>
                                <div className='flex gap-x-3'>
                                    <Badge variant='outline'>ID</Badge>
                                    <p className='text-sm'>{patient.patient_id}</p>
                                </div>

                                <p className='text-sm text-muted-foreground'>Created on {new Date(patient.createdAt).toLocaleString()}</p>

                                <Accordion type='single' collapsible>
                                    <AccordionItem value='history' className='border-none'>
                                        <AccordionTrigger>History</AccordionTrigger>
                                        <AccordionContent>
                                            <History history={patient.history} />
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </CardContent>
                        </Card>
                    </div>

                    {isOwner && (
                        <div className='flex flex-col gap-y-4 col-span-7'>
                            <Card className='w-full h-fit'>
                                <CardHeader>
                                    <div className='flex space-x-2 items-center'>
                                        <CardTitle className='text-xl'>Admin Controls</CardTitle>
                                        <VscSettings size={20} />
                                    </div>
                                </CardHeader>
                                <CardContent className='flex gap-x-4'>
                                    <Button variant={'secondary'}>
                                        View Access Requests <BsPersonFillLock size={20} className='ml-1' />
                                    </Button>
                                    <Button variant={'destructive'}>
                                        Transfer Ownership <BiTransfer size={20} className='ml-1' />
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className='w-full h-fit'>
                                <CardHeader>
                                    <div className='flex justify-between'>
                                        <div className='flex space-x-2 items-center'>
                                            <CardTitle className='text-xl'>Attached Files</CardTitle>
                                            <LuFiles size={20} />
                                        </div>

                                        <div className='flex gap-x-3'>
                                            <FileShareDialog patient_id={patient.patient_id} files={selectedFiles} disabled={selectedFiles.length === 0} />
                                            <FileDeleteDialog
                                                patient_id={patient.patient_id}
                                                files={selectedFiles}
                                                reset={() => {
                                                    setRowSelection({});
                                                }}
                                                disabled={selectedFiles.length === 0}
                                            />

                                            <FileUploadDialog patient_id={patient.patient_id} />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <DataTable table={table} />
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
