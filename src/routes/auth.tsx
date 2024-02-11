import { AppDispatch, RootState } from '@/redux/store';
import { Link, createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { logout, setAuthError, updateUser } from '@/redux/slices/userSlice';
import { login, loginFormSchema, register, signUpFormSchema } from '@/api';
import { useMutation } from '@tanstack/react-query';

export const Route = createFileRoute('/auth')({
    component: Auth,
    onEnter: () => {
        document.title = 'Auth | MedChain';
    },
});

function Auth() {
    const user = useSelector((state: RootState) => state.auth.user);
    const dispatch = useDispatch<AppDispatch>();
    const [isRegistering, setIsRegistering] = useState(false);

    const switchRegistrationMode = () => {
        dispatch(setAuthError(''));
        setIsRegistering((prevState) => !prevState);
    };

    return (
        <div className='flex-grow flex justify-center items-center overflow-hidden'>
            <div className='w-full m-auto lg:max-w-lg'>
                {user ? (
                    <Card>
                        <CardHeader className='space-y-1'>
                            <CardTitle className='text-2xl text-center'>You're already logged in.</CardTitle>
                        </CardHeader>
                        <CardContent className='grid gap-4'>
                            <Link to={'/account'} className='w-full'>
                                <Button variant={'secondary'} className='w-full'>
                                    Go to My Account
                                </Button>
                            </Link>
                            <Button
                                variant={'destructive'}
                                onClick={() => {
                                    dispatch(setAuthError(''));
                                    dispatch(logout());
                                }}>
                                Logout
                            </Button>
                        </CardContent>
                    </Card>
                ) : isRegistering ? (
                    <SignUpForm switchRegistrationMode={switchRegistrationMode} />
                ) : (
                    <LoginForm switchRegistrationMode={switchRegistrationMode} />
                )}
            </div>
        </div>
    );
}

interface SignUpFormProps {
    switchRegistrationMode: () => void;
}

const SignUpForm = ({ switchRegistrationMode }: SignUpFormProps) => {
    const dispatch = useDispatch<AppDispatch>();

    const signUpform = useForm<z.infer<typeof signUpFormSchema>>({
        resolver: zodResolver(signUpFormSchema),
        defaultValues: {
            username: '',
            password: '',
            confirmPassword: '',
        },
    });

    const signUpMutation = useMutation({
        mutationFn: register,
        onSuccess: (data) => {
            dispatch(updateUser(data));
        },
    });

    const onSubmitSignUp = (values: z.infer<typeof signUpFormSchema>) => {
        signUpMutation.mutate(values);
    };

    return (
        <Form {...signUpform}>
            <form onSubmit={signUpform.handleSubmit(onSubmitSignUp)} className='space-y-8'>
                <Card>
                    <CardHeader className='space-y-1'>
                        <CardTitle className='text-2xl text-center'>Create an account</CardTitle>
                        <CardDescription className='text-center'>Enter your username and password to sign up</CardDescription>
                    </CardHeader>
                    <CardContent className='grid gap-4'>
                        <FormField
                            control={signUpform.control}
                            name='username'
                            render={({ field }) => (
                                <FormItem>
                                    <Label>Username</Label>
                                    <FormControl>
                                        <Input placeholder='' {...field} type='text' autoComplete='off' autoCapitalize='off' />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={signUpform.control}
                            name='password'
                            render={({ field }) => (
                                <FormItem>
                                    <Label>Password</Label>
                                    <FormControl>
                                        <Input placeholder='' {...field} type='password' />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={signUpform.control}
                            name='confirmPassword'
                            render={({ field }) => (
                                <FormItem>
                                    <Label>Confirm Password</Label>
                                    <FormControl>
                                        <Input placeholder='' {...field} type='password' />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {signUpMutation.error?.message && <p className='text-red-500 text-center text-sm'>{signUpMutation.error?.message}</p>}

                        <Button type='submit' className='w-full'>
                            {signUpMutation.isPending && (
                                <svg className='animate-spin -ml-1 mr-3 h-5 w-5' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                                    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                                    <path
                                        className='opacity-75'
                                        fill='currentColor'
                                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                                </svg>
                            )}
                            Sign Up
                        </Button>

                        <p className='text-xs text-center text-gray-700'>
                            Already have an account?{' '}
                            <span className=' text-blue-600 hover:underline cursor-pointer' onClick={switchRegistrationMode}>
                                Sign In
                            </span>
                        </p>
                    </CardContent>
                </Card>
            </form>
        </Form>
    );
};

interface LoginFormProps {
    switchRegistrationMode: () => void;
}

const LoginForm = ({ switchRegistrationMode }: LoginFormProps) => {
    const dispatch = useDispatch<AppDispatch>();

    const loginform = useForm<z.infer<typeof loginFormSchema>>({
        resolver: zodResolver(loginFormSchema),
        defaultValues: {
            username: '',
            password: '',
        },
    });

    const loginMutation = useMutation({
        mutationFn: login,
        onSuccess: (data) => {
            dispatch(updateUser(data));
        },
    });

    const onSubmitLogin = (values: z.infer<typeof loginFormSchema>) => {
        loginMutation.mutate(values);
    };

    return (
        <Form {...loginform}>
            <form onSubmit={loginform.handleSubmit(onSubmitLogin)} className='space-y-8'>
                <Card>
                    <CardHeader className='space-y-1'>
                        <CardTitle className='text-2xl text-center'>Login to your account</CardTitle>
                        <CardDescription className='text-center'>Enter your username and password to continue</CardDescription>
                    </CardHeader>
                    <CardContent className='grid gap-4'>
                        <FormField
                            control={loginform.control}
                            name='username'
                            render={({ field }) => (
                                <FormItem>
                                    <Label>Username</Label>
                                    <FormControl>
                                        <Input placeholder='' {...field} type='text' autoComplete='off' autoCapitalize='off' />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={loginform.control}
                            name='password'
                            render={({ field }) => (
                                <FormItem>
                                    <Label>Password</Label>
                                    <FormControl>
                                        <Input placeholder='' {...field} type='password' />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {loginMutation.error?.message && <p className='text-red-500 text-center text-sm'>{loginMutation.error?.message}</p>}

                        <Button type='submit' className='w-full'>
                            {loginMutation.isPending && (
                                <svg className='animate-spin -ml-1 mr-3 h-5 w-5' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                                    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                                    <path
                                        className='opacity-75'
                                        fill='currentColor'
                                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                                </svg>
                            )}
                            Login
                        </Button>

                        <p className='text-xs text-center text-gray-700'>
                            Don't have an account?{' '}
                            <span className=' text-blue-600 hover:underline cursor-pointer' onClick={switchRegistrationMode}>
                                Register
                            </span>
                        </p>
                    </CardContent>
                </Card>
            </form>
        </Form>
    );
};
