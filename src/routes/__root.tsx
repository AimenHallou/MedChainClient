import { setBearerToken } from '@/api';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { checkConnection } from '@/redux/slices/blockchainSlice';
import { getMe } from '@/redux/slices/userSlice';
import { AppDispatch } from '@/redux/store';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

export const Route = createRootRoute({
    component: Root,

    notFoundComponent: () => {
        return (
            <div className='min-h-screen bg-background text-foreground flex flex-col'>
                <Header />

                <div className='flex-1 flex items-center justify-center'>
                    <h1 className='text-3xl'>404 Not Found</h1>
                </div>

                <Footer />
            </div>
        );
    },
});

function Root() {
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        const token = JSON.parse(localStorage.getItem('token') || '{}');

        setBearerToken(token);
    }, []);

    useEffect(() => {
        dispatch(getMe());
        dispatch(checkConnection());
    }, [dispatch]);

    return (
        <>
            <div className='min-h-screen bg-background text-foreground flex flex-col'>
                <Header />

                <Outlet />

                <Footer />
            </div>
        </>
    );
}
