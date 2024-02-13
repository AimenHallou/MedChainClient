import { getPatientsSharedWithMe } from '@/api';
import PatientCard from '@/components/PatientCard/PatientCard';
import PatientCardSkeleton from '@/components/PatientCard/PatientCardSkeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { BiSearch } from 'react-icons/bi';
import { FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';

const PatientsSharedWithMeModule = () => {
    const [pagination, setPagination] = useState({ page: 0, limit: 15 });

    const [filter, setFilter] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('-1');

    const { data, isLoading: patientIsLoading, isError, error } = useQuery({
        queryKey: ['patientsSharedWithMe', pagination.page, pagination.limit, filter, sortBy, sortOrder],
        queryFn: () => getPatientsSharedWithMe(pagination.page, pagination.limit, filter, sortBy, sortOrder),
        retry: 1,
    });

    if (patientIsLoading) {
        return (
          <div>
            <p>Loading</p>
          </div>
        );
      }
    
    if (isError) {
        return (
        <div>
            <p>{error.message}</p>
        </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className='flex justify-between'>
                    <div className='flex gap-x-5 items-center'>
                        <div className='flex items-center relative'>
                            <Input placeholder='filter' className='pr-8' value={filter} onChange={(e) => setFilter(e.target.value)} />
                            <BiSearch className='h-5 w-5 absolute right-2' />
                        </div>

                        {filter && (
                            <div>
                                <p>{data?.totalCount} results</p>
                            </div>
                        )}

                        <div className='flex items-center gap-x-2.5 ml-5'>
                            <p>Sort by</p>

                            <Select defaultValue={'createdAt'} value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className='w-[180px]'>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='createdAt'>Date Created</SelectItem>
                                    <SelectItem value='patient_id'>Patient ID</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select defaultValue={'-1'} value={sortOrder} onValueChange={setSortOrder}>
                                <SelectTrigger className='w-[180px]'>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='-1'>
                                        <div className='flex items-center gap-x-3'>
                                            <FaSortAmountDown /> Descending
                                        </div>
                                    </SelectItem>
                                    <SelectItem value='1' className='flex'>
                                        <div className='flex items-center gap-x-3'>
                                            <FaSortAmountUp /> Ascending
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className='grid gap-4'>
                <div className='grid grid-cols-3 gap-3'>
                    {patientIsLoading && Array.from({ length: 6 }).map((_, i) => <PatientCardSkeleton key={i} />)}

                    {data?.patients?.map((patient) => {
                        return <PatientCard key={patient.patient_id} patient={patient} />;
                    })}

                    {!patientIsLoading && data?.patients?.length === 0 && (
                        <div className='col-span-3 flex justify-center items-center'>
                            <p className='text-muted-foreground'>No patients found</p>
                        </div>
                    )}
                </div>

                {data && data.totalCount > 0 && (
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
    );
};

export default PatientsSharedWithMeModule;
