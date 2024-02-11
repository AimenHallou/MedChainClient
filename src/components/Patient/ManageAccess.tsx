import { IPatient, ISharedList, IUser } from '@/types/patient';
import { BsPersonFillLock } from 'react-icons/bs';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { useState } from 'react';
import { LuLayoutList } from 'react-icons/lu';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rejectAccessRequest } from '@/api';
import FileApproveDialog from '../Dialogs/FileApproveDialog';

interface Props {
    patient: IPatient;
    sharedList: ISharedList[];
    accessRequests: IUser[];
}

const ManageAccess = ({ patient, sharedList, accessRequests }: Props) => {
    const queryClient = useQueryClient();

    const [isManageAccess, setIsManageAccess] = useState(true);

    const toggleManageAccess = () => {
        setIsManageAccess((prev) => !prev);
    };

    const rejectAccessRequestMutation = useMutation({
        mutationFn: rejectAccessRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [patient.patient_id] });
        },
    });

    return (
        <Card className='w-full h-fit'>
            <CardHeader>
                <div className='flex justify-between'>
                    <div className='flex space-x-2 items-center'>
                        {isManageAccess ? (
                            <>
                                <CardTitle className='text-xl'>Manage Access</CardTitle>
                                <BsPersonFillLock size={20} className='ml-1' />
                            </>
                        ) : (
                            <>
                                <CardTitle className='text-xl'>Access Requests</CardTitle>
                                <LuLayoutList size={20} className='ml-1' />
                            </>
                        )}
                    </div>

                    <div className='flex gap-x-3'>
                        <Button variant={'secondary'} onClick={toggleManageAccess}>
                            {isManageAccess ? 'View Access Requests' : 'Manage Access'}
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {isManageAccess ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Username</TableHead>
                                <TableHead>ID</TableHead>
                                <TableHead>Files Shared</TableHead>
                                <TableHead className='flex justify-center items-center'>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sharedList.map((item) => {
                                return (
                                    <TableRow key={item.user._id}>
                                        <TableCell>{item.user.username}</TableCell>
                                        <TableCell>{item.user._id}</TableCell>
                                        <TableCell>{item.files.length}</TableCell>
                                        <TableCell className='flex justify-center items-center'>
                                            <Button variant='secondary' className='h-8 w-fit'>
                                                Edit
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                ) : accessRequests.length > 0 ? (
                    <>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Username</TableHead>
                                    <TableHead>ID</TableHead>
                                    <TableHead className='flex justify-center items-center'>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {accessRequests.map((user) => {
                                    return (
                                        <TableRow key={user._id}>
                                            <TableCell>{user.username}</TableCell>
                                            <TableCell>{user._id}</TableCell>
                                            <TableCell className='flex justify-center items-center gap-x-3'>
                                                <FileApproveDialog
                                                    files={patient.content}
                                                    username={user.username}
                                                    patient_id={patient.patient_id}
                                                    reset={() => {}}
                                                />

                                                <Button
                                                    variant='destructive'
                                                    className='h-8 w-fit'
                                                    onClick={() => {
                                                        rejectAccessRequestMutation.mutate({ patient_id: patient.patient_id, id: user._id! });
                                                    }}>
                                                    Deny
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </>
                ) : (
                    <p className='text-center text-muted-foreground'>No access requests</p>
                )}
            </CardContent>
        </Card>
    );
};

export default ManageAccess;
