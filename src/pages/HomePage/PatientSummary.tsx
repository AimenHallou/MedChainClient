import { getPatientCount } from '@/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { FaUserInjured } from 'react-icons/fa';

const PatientSummary = () => {
    const { data: patientCount } = useQuery({ queryKey: ['patientCount'], queryFn: getPatientCount });

    return (
        <Card>
            <CardHeader>
                <div className='flex space-x-2 items-center'>
                    <CardTitle className='text-xl'>Patient Summary</CardTitle>
                    <FaUserInjured size={20} />
                </div>
            </CardHeader>
            <CardContent className='grid gap-4'>
                <p className='text-sm font-semibold text-sub-text'>Total Patients: {patientCount}</p>
            </CardContent>
        </Card>
    );
};

export default PatientSummary;
