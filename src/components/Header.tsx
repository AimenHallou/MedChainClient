import { logout } from '@/redux/slices/userSlice';
import { RootState } from '@/redux/store';
import { MdSettings } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../redux/store';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Link } from '@tanstack/react-router';

const Header = () => {
    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector((state: RootState) => state.auth.user);

    return (
        <header className='flex justify-between items-center px-20 py-2 transition-all duration-200 border-b'>
            <nav className='flex'>
                <Link to='/'>
                    <img src='logo.png' alt='Logo' className='h-10 mr-3' />
                </Link>
            </nav>
            <div className='flex gap-4'>
                {user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant={'secondary'}>{user.username}</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className='w-56'>
                            <DropdownMenuGroup>
                                <DropdownMenuItem asChild>
                                    <Link to={'/account'}>My Account</Link>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>

                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => {
                                    dispatch(logout());
                                }}>
                                <p className='text-red-400'>Log out</p>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <Link to='/auth'>
                        <Button variant={'secondary'}>Login</Button>
                    </Link>
                )}
                <Link className='flex items-center' to='/settings'>
                    <MdSettings size={24} color='white' />
                </Link>
            </div>
        </header>
    );
};

export default Header;
