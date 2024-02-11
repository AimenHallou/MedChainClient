import { transferOwnership, transferOwnershipSchema } from '@/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import { Label } from '@radix-ui/react-dropdown-menu';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { BiTransfer } from 'react-icons/bi';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '../ui/form';
import { Input } from '../ui/input';

interface Props {
    patient_id: string;
    disabled?: boolean;
    reset: () => void;
}

const TransferOwnershipDialog = ({ patient_id, disabled = false, reset }: Props) => {
    const queryClient = useQueryClient();

    const [dialogOpen, setDialogOpen] = useState(false);

    const transferOwnershipForm = useForm<z.infer<typeof transferOwnershipSchema>>({
        resolver: zodResolver(transferOwnershipSchema),
        defaultValues: {
            patient_id,
            username: '',
        },
        reValidateMode: 'onChange',
    });

    const transferOwnershipMutation = useMutation({
        mutationFn: transferOwnership,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [patient_id] });
            reset();
            setDialogOpen(false);
        },
    });

    const onSubmit = (values: z.infer<typeof transferOwnershipSchema>) => {
        transferOwnershipMutation.mutate(values);
    };

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button
                    disabled={disabled}
                    variant={'destructive'}
                    onClick={() => {
                        transferOwnershipForm.reset();
                        transferOwnershipMutation.reset();
                        setDialogOpen(true);
                    }}>
                    Transfer Ownership <BiTransfer size={20} className='ml-1' />
                </Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-lg'>
                <DialogHeader>
                    <DialogTitle>Transfer ownership</DialogTitle>
                    <DialogDescription className='text-red-600'>
                        This is dangerous action and it <strong>cannot be reversed</strong>
                    </DialogDescription>
                </DialogHeader>

                <Form {...transferOwnershipForm}>
                    <form id='transferOwnershipForm' onSubmit={transferOwnershipForm.handleSubmit(onSubmit)} className='space-y-4' autoComplete='off'>
                        <FormField
                            control={transferOwnershipForm.control}
                            name='username'
                            render={({ field }) => (
                                <FormItem>
                                    <Label>Username</Label>
                                    <FormControl>
                                        <Input placeholder='Username of user to transfer to' {...field} type='text' autoComplete='off' autoCapitalize='off' />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={transferOwnershipForm.control}
                            name='password'
                            render={({ field }) => (
                                <FormItem>
                                    <Label>Enter your password</Label>
                                    <FormControl>
                                        <Input placeholder='Password' {...field} type='password' autoComplete='off' autoCapitalize='off' />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>

                {transferOwnershipMutation.error?.message && <p className='text-red-500 text-center text-sm'>{transferOwnershipMutation.error.message}</p>}

                <DialogFooter className='sm:justify-start'>
                    <Button type='submit' form='transferOwnershipForm' variant={'destructive'}>
                        {transferOwnershipMutation.isPending && (
                            <svg className='animate-spin -ml-1 mr-3 h-5 w-5' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                                <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                                <path
                                    className='opacity-75'
                                    fill='currentColor'
                                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                            </svg>
                        )}
                        Transfer
                    </Button>

                    <DialogClose asChild>
                        <Button
                            type='button'
                            variant='secondary'
                            onClick={() => {
                                setDialogOpen(false);
                            }}>
                            Close
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default TransferOwnershipDialog;
