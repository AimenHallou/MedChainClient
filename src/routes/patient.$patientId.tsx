import { cancelAccessRequest, getPatient, requestAccess } from '@/api';
import { DataTable } from '@/components/DataTable';
import FileDeleteDialog from '@/components/Dialogs/FileDeleteDialog';
import FileEditDialog from '@/components/Dialogs/FileEditDialog';
import FileShareDialog from '@/components/Dialogs/FileShareDialog';
import FileUploadDialog from '@/components/Dialogs/FileUploadDialog';
import TransferOwnershipDialog from '@/components/Dialogs/TransferOwnershipDialog';
import { columns } from '@/components/FileTable/columns';
import History from '@/components/History';
import ManageAccess from '@/components/Patient/ManageAccess';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { RootState } from '@/redux/store';
import { IFile } from '@/types/patient';
import { shortenAddress } from '@/utils/shortenAddress';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useCallback, useMemo, useState, useEffect } from 'react';
import { FaUser, FaUserInjured } from 'react-icons/fa';
import { FiDownload } from 'react-icons/fi';
import { LuFiles } from 'react-icons/lu';
import { useSelector } from 'react-redux';

export const Route = createFileRoute('/patient/$patientId')({
    // Or in a component
    component: PatientComponent,
    onEnter: ({ params }) => {
        document.title = `${params.patientId} | MedChain`;
    },
});

function PatientComponent() {
    const queryClient = useQueryClient();

    const user = useSelector((state: RootState) => state.auth.user);
    const { patientId } = Route.useParams();

    const { data, isLoading, isError, error } = useQuery({
        queryKey: [patientId],
        queryFn: () => getPatient(patientId),
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        retry: 2,
    });

    const [rowSelection, setRowSelection] = useState({});

    const table = useReactTable({
        data: data?.patient?.content || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        onRowSelectionChange: setRowSelection,
        state: {
            rowSelection,
        },
    });

    const isOwner = useMemo(() => {
        if (!data?.owner) {
            return false;
        }

        return data?.owner?._id === user?._id;
    }, [data?.owner, user?._id]);

    const selectedFiles: IFile[] = useMemo(() => {
        if (isError || isLoading) {
            return [];
        }

        if (Object.keys(rowSelection)?.length === 0) return [];

        const files = [];

        for (const key in rowSelection) {
            if (data?.patient?.content[parseInt(key)]) {
                files.push(data?.patient?.content[parseInt(key)]);
            }
        }

        return files;
    }, [rowSelection, data?.patient?.content, isError, isLoading]);

    const handleOnDownload = useCallback(() => {
        const download = (base64: string, name: string) => {
            const byteString = atob(base64);
            const arrayBuffer = new ArrayBuffer(byteString.length);
            const int8Array = new Uint8Array(arrayBuffer);
            for (let i = 0; i < byteString.length; i++) {
                int8Array[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([arrayBuffer], {
                type: 'application/octet-stream',
            });

            const blobUrl = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
        };

        for (const file of selectedFiles) {
            download(file.base64, file.name);
        }

        setRowSelection({});
    }, [selectedFiles]);

    const requestAccessMutation = useMutation({
        mutationFn: () => requestAccess(patientId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [patientId] });
        },
    });

    const cancelAccessRequestMutation = useMutation({
        mutationFn: () => cancelAccessRequest(patientId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [patientId] });
        },
    });

    const requestButton = useMemo(() => {
        if (isError || isLoading) {
            return null;
        }

        if (isOwner) {
            return null;
        }

        if (data?.patient?.content?.length !== 0) {
            return null;
        }

        if (user && data?.patient?.accessRequests?.includes(user._id!)) {
            return (
                <Button
                    className='ml-5'
                    variant={'secondary'}
                    onClick={() => {
                        cancelAccessRequestMutation.mutate();
                    }}>
                    Cancel Request
                </Button>
            );
        }

        return (
            <Button
                className='ml-5'
                onClick={() => {
                    requestAccessMutation.mutate();
                }}>
                Request Access
            </Button>
        );
    }, [isOwner, data?.patient?.content?.length, user, data?.patient?.accessRequests, requestAccessMutation, cancelAccessRequestMutation, isError, isLoading]);

    useEffect(() => {
        console.log(data?.patient.content);
    }, [data?.patient?.content]);

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

    if (!data) {
        return (
            <div className='flex-grow h-full'>
                <div className='max-w-7xl mx-auto mt-10 flex justify-center'>Error fetching data</div>
            </div>
        );
    }

    const { owner, patient, sharedList, accessRequests } = data;

    return (
        <div className='flex-grow h-full'>
            <div className='max-w-7xl mx-auto mt-10 flex justify-center'>
                <div className={cn('grid gap-4', !isOwner ? 'grid-cols-12' : 'grid-cols-12')}>
                    <div className={cn('flex flex-col gap-y-4', !isOwner ? 'col-span-3' : 'col-span-3')}>
                        <Card className='h-fit'>
                            <CardHeader>
                                <div className='flex space-x-2 items-center'>
                                    <CardTitle className='text-xl'>Owner Information</CardTitle>
                                    <FaUser size={20} />
                                </div>
                            </CardHeader>
                            <CardContent className='grid gap-4'>
                                <div className='flex gap-x-3'>
                                    <Badge variant='outline'>ID</Badge>
                                    <p className='text-sm'>{owner._id}</p>
                                </div>

                                <div className='flex gap-x-3'>
                                    <Badge variant='outline'>Name</Badge>
                                    <p className='text-sm'>{owner.name}</p>
                                </div>

                                {owner.address && (
                                    <div className='flex gap-x-3'>
                                        <Badge variant='outline'>Address</Badge>
                                        <p className='text-sm'>{shortenAddress(owner.address)}</p>
                                    </div>
                                )}

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
                        <Card className='h-fit w-full'>
                            <CardHeader>
                                <div className='flex justify-between'>
                                    <div className='flex space-x-2 items-center'>
                                        <CardTitle className='text-xl'>Patient</CardTitle>
                                        <FaUserInjured size={20} />
                                    </div>

                                    {requestButton}
                                </div>
                            </CardHeader>
                            <CardContent className='grid gap-4'>
                                <div className='flex gap-x-3'>
                                    <Badge variant='outline'>ID</Badge>
                                    <p className='text-sm'>{patient.patient_id}</p>
                                </div>

                                <p className='text-sm text-muted-foreground'>Created on {new Date(patient.createdAt).toLocaleString()}</p>

                                {isOwner && <TransferOwnershipDialog patient_id={patient.patient_id} reset={() => {}} />}

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

                    <div className='flex flex-col gap-y-4 col-span-9'>
                        <Card className='w-full h-fit'>
                            <CardHeader>
                                <div className='flex justify-between'>
                                    <div className='flex space-x-2 items-center'>
                                        <CardTitle className='text-xl'>Attached Files</CardTitle>
                                        <LuFiles size={20} />
                                    </div>

                                    <div className='flex gap-x-3'>
                                        <Button disabled={selectedFiles.length === 0} variant={'outline'} onClick={handleOnDownload}>
                                            Download <FiDownload size={15} className='ml-1' />
                                        </Button>
                                        {isOwner && (
                                            <>
                                                {selectedFiles[0] && (
                                                    <FileEditDialog
                                                        patient_id={patient.patient_id}
                                                        file={selectedFiles[0]}
                                                        disabled={selectedFiles.length !== 1}
                                                        reset={() => {
                                                            setRowSelection({});
                                                        }}
                                                    />
                                                )}
                                                <FileShareDialog
                                                    patient_id={patient.patient_id}
                                                    files={selectedFiles}
                                                    reset={() => {
                                                        setRowSelection({});
                                                    }}
                                                    disabled={selectedFiles.length === 0}
                                                />
                                                <FileDeleteDialog
                                                    patient_id={patient.patient_id}
                                                    files={selectedFiles}
                                                    reset={() => {
                                                        setRowSelection({});
                                                    }}
                                                    disabled={selectedFiles.length === 0}
                                                />

                                                <FileUploadDialog patient_id={patient.patient_id} />
                                            </>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <DataTable table={table} />
                            </CardContent>
                        </Card>

                        {isOwner && patient && accessRequests && <ManageAccess patient={patient} sharedList={sharedList} accessRequests={accessRequests} />}
                    </div>
                </div>
            </div>
        </div>
    );
}
