import { MdSettings } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

const Header = () => {
    const user = useSelector((state: RootState) => state.auth.user);

    return (
        <header className='flex justify-between items-center px-20 py-4 transition-all duration-200 border-b-2 border-gray-700'>
            <nav className='flex'>
                <Link to='/'>
                    <img src='logo.png' alt='Logo' className='h-12 mr-3' />
                </Link>
            </nav>
            <div className='flex gap-4'>
                <Button>{user ? <Link to='/account'>{user.username}</Link> : <Link to='/auth'>{'Login'}</Link>}</Button>
                <Link className='flex items-center' to='/settings'>
                    <MdSettings size={24} color='white' />
                </Link>
            </div>
        </header>
    );
};

export default Header;
