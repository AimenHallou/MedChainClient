import { IPatient, ISharedList } from '@/types/patient';
import { BsPersonFillLock } from 'react-icons/bs';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

interface Props {
    patient: IPatient;
    sharedList: ISharedList[];
}

const ManageAccess = ({ sharedList }: Props) => {
    return (
        <Card className='w-full h-fit'>
            <CardHeader>
                <div className='flex justify-between'>
                    <div className='flex space-x-2 items-center'>
                        <CardTitle className='text-xl'>Manage Access</CardTitle>
                        <BsPersonFillLock size={20} className='ml-1' />
                    </div>

                    <div className='flex gap-x-3'>
                        <Button variant={'secondary'}>View Access Requests</Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>ID</TableHead>
                            <TableHead>Files Shared</TableHead>
                            <TableHead className='flex justify-center items-center'>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sharedList.map((item) => {
                            return (
                                <TableRow key={item.user._id}>
                                    <TableCell>{item.user.name}</TableCell>
                                    <TableCell>{item.user._id}</TableCell>
                                    <TableCell>{item.files.length}</TableCell>
                                    <TableCell className='flex justify-center items-center'>
                                        <Button variant='ghost' className='h-8 w-8 p-0'>
                                            Edit
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

export default ManageAccess;
