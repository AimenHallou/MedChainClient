import { getPatients } from '@/api';
import AddPatientDialog from '@/components/Dashboard/AddPatientDialog';
import PatientCard from '@/components/PatientCard/PatientCard';
import PatientCardSkeleton from '@/components/PatientCard/PatientCardSkeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { BiSearch } from 'react-icons/bi';
import { FaUser } from 'react-icons/fa';
import PatientSummary from '../components/Dashboard/PatientSummary';
import RecentPatients from '../components/Dashboard/RecentPatients';

export const Route = createFileRoute('/')({
    component: Index,
    onEnter: () => {
        document.title = 'Home | MedChain';
    },
});

function Index() {
    const [pagination, setPagination] = useState({ page: 0, limit: 15 });

    const [filter, setFilter] = useState('');

    const { data, isLoading: patientIsLoading } = useQuery({
        queryKey: ['patients', pagination.page, pagination.limit, filter],
        queryFn: () => getPatients(pagination.page, pagination.limit, filter),
    });

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
                                <div className='flex gap-x-10 items-center'>
                                    <div className='flex space-x-2 items-center'>
                                        <CardTitle className='text-2xl'>Patients</CardTitle>
                                        <FaUser size={18} className='hover:text-gray-400 transition-colors duration-200' />
                                    </div>

                                    <div className='flex items-center relative'>
                                        <Input placeholder='filter' className='pr-8' value={filter} onChange={(e) => setFilter(e.target.value)} />
                                        <BiSearch className='h-5 w-5 absolute right-2' />
                                    </div>

                                    {filter && (
                                        <div>
                                            <p>{data?.totalCount} results</p>
                                        </div>
                                    )}
                                </div>

                                <AddPatientDialog />
                            </div>
                        </CardHeader>
                        <CardContent className='grid gap-4'>
                            <div className='grid grid-cols-3 gap-5'>
                                {patientIsLoading && Array.from({ length: 6 }).map((_, i) => <PatientCardSkeleton key={i} />)}

                                {data?.patients.map((patient) => {
                                    return <PatientCard key={patient.patient_id} patient={patient} />;
                                })}
                            </div>

                            {data && (
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
                                        {Array.from({ length: Math.ceil(data.totalCount / pagination.limit) }).map((_, i) => (
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
                                                    if (pagination.page < Math.floor(data.totalCount / pagination.limit)) {
                                                        setPagination((prev) => ({ ...prev, page: prev.page + 1 }));
                                                    }
                                                }}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
