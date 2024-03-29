import { IPatient } from '@/types/patient';
import { useNavigate } from '@tanstack/react-router';
import { BsFillFilePersonFill } from 'react-icons/bs';
import { Card, CardHeader, CardTitle } from '../ui/card';

interface Props {
    patient: IPatient;
}

const PatientCard = ({ patient }: Props) => {
    const navigate = useNavigate();

    return (
        <Card
            className='bg-secondary cursor-pointer hover:scale-105 transition-all'
            onClick={() => navigate({ to: '/patient/$patientId', params: { patientId: patient.patient_id } })}>
            <CardHeader>
                <div className='flex justify-between items-center gap-x-4'>
                    <div className='grid gap-2'>
                        <CardTitle>{patient.patient_id}</CardTitle>
                        <p className='text-xs'>Owner ID: {patient.owner_id}</p>
                        <p className='text-xs text-muted-foreground'>{new Date(patient.createdAt).toLocaleString()}</p>
                    </div>
                    <BsFillFilePersonFill className='text-blue-500 h-12 w-12 flex-shrink-0' />
                </div>
            </CardHeader>
        </Card>
    );
};

export default PatientCard;
