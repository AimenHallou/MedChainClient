import { getMe } from '@/api';
import { useQuery } from '@tanstack/react-query';
import { Navigate } from '@tanstack/react-router';
import { useEffect } from 'react';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const data = useQuery({
        queryKey: ['me'],
        queryFn: () => getMe(),
        retry: 0,
    });

    useEffect(() => {
        console.log(data.isError, data.isFetched, data.isLoading);
    }, [data]);

    if (data.isError && data.isFetched && !data.isLoading) {
        return <Navigate to='/auth' replace />;
    }

    return children;
};

export default ProtectedRoute;
