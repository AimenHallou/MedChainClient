import { getRecentPatients } from '@/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { FaRegChartBar } from 'react-icons/fa';
import PatientCardSkeleton from '../PatientCard/PatientCardSkeleton';

interface Props extends React.HTMLAttributes<HTMLDivElement> {}

const RecentPatients = ({ ...rest }: Props) => {
    const { data: recentPatients, isLoading } = useQuery({
        queryKey: ['recentPatients'],
        queryFn: () => getRecentPatients(3),
    });

    return (
        <Card {...rest}>
            <CardHeader>
                <div className='flex space-x-2 items-center'>
                    <CardTitle className='text-xl'>Recent Patients</CardTitle>
                    <FaRegChartBar size={20} />
                </div>
            </CardHeader>

            <CardContent className='grid grid-cols-1 gap-3'>
                {isLoading && Array.from({ length: 2 }).map((_, i) => <PatientCardSkeleton key={i} />)}

                {recentPatients?.map((patient) => {
                    return (
                        <Card key={patient.patient_id} className='bg-secondary cursor-pointer hover:scale-105 transition-all'>
                            <CardHeader>
                                <div className='flex justify-between items-center gap-x-5'>
                                    <div className='grid gap-2'>
                                        <CardTitle>{patient.patient_id}</CardTitle>
                                        <p className='text-xs'>Owner ID: {patient.owner_id}</p>
                                        <p className='text-xs text-muted-foreground'>{new Date(patient.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                    );
                })}
            </CardContent>
        </Card>
    );
};

export default RecentPatients;
