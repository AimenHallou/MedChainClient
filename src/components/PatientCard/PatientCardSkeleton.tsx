import { Card, CardHeader } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

const PatientCardSkeleton = () => {
    return (
        <Card>
            <CardHeader>
                <div className='flex justify-between items-center gap-x-5'>
                    <div className='grid gap-3'>
                        <Skeleton className='h-4 w-[100px]' />
                        <Skeleton className='h-4 w-[200px]' />
                        <Skeleton className='h-4 w-[200px]' />
                    </div>
                    <Skeleton className='h-12 w-12' />
                </div>
            </CardHeader>
        </Card>
    );
};

export default PatientCardSkeleton;
