import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Route, Routes, useLocation } from 'react-router-dom';
import Footer from './components/Footer';
import Header from './components/Header';
import HomePage from './pages/HomePage/HomePage';
import { checkConnection } from './redux/slices/blockchainSlice';
import { AppDispatch } from './redux/store';
import AccountPage from './pages/AccountPage';
import SettingsPage from './pages/SettingsPage';
import { AuthPage } from './pages/AuthPage';
import { getMe } from './redux/slices/userSlice';

function App() {
    const dispatch = useDispatch<AppDispatch>();
    const location = useLocation();

    useEffect(() => {
        dispatch(getMe());
        dispatch(checkConnection());
    }, [dispatch]);

    return (
        <div className='min-h-screen bg-background text-foreground flex flex-col pb-20'>
            <Header />

            <Routes location={location} key={location.pathname}>
                <Route index element={<HomePage />} />
                <Route path='/account' element={<AccountPage />} />
                <Route path='/settings' element={<SettingsPage />} />
                <Route path='/auth' element={<AuthPage />} />
            </Routes>

            <Footer />
        </div>
    );
}

export default App;
