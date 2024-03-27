import { AppDispatch, RootState } from "@/redux/store";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { linkAddress, unlinkAddress } from "@/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { connect } from "@/redux/slices/blockchainSlice";
import {
  setAuthError,
  updateDetails,
  updateUser,
} from "@/redux/slices/userSlice";
import { shortenAddress } from "@/utils/shortenAddress";
import { useMutation } from "@tanstack/react-query";

export const Route = createFileRoute("/account")({
  component: () => <Account />,
  onEnter: () => {
    document.title = "Account | MedChain";
  },
});

function Account() {
  const blockchain = useSelector((state: RootState) => state.blockchain);
  const address = useSelector((state: RootState) => state.auth.user?.address);
  const dispatch = useDispatch<AppDispatch>();

  const linkAddressMutation = useMutation({
    mutationFn: linkAddress,
    onSuccess: (data) => {
      dispatch(updateUser(data));
    },
  });

  const unlinkAddressMutation = useMutation({
    mutationFn: unlinkAddress,
    onSuccess: (data) => {
      dispatch(updateUser(data));
    },
  });

  return (
    <div className="flex-grow flex overflow-hidden">
      <div className="w-full m-auto lg:max-w-5xl grid gap-6 mt-10">
        <h1 className="font-semibold tracking-tight text-3xl text-center">
          My Account
        </h1>

        <div className="flex items-start gap-x-4">
          <EditProfileForm className="flex-1" />

          <Card className="min-w-[300px]">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl text-center">
                MetaMask Connection
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5">
              <p>
                Linked Address:{" "}
                {address ? (
                  <span className="text-green-400">
                    {shortenAddress(address)}
                  </span>
                ) : (
                  <span className="text-red-400">N/A</span>
                )}
              </p>

              {address ? (
                <Button
                  variant={"destructive"}
                  onClick={() => {
                    unlinkAddressMutation.mutate();
                  }}
                >
                  Unlink Address
                </Button>
              ) : (
                <>
                  {blockchain.hasMetaMask ? (
                    blockchain.account ? (
                      <>
                        <p>
                          Detected:{" "}
                          <span className="text-green-400">
                            {shortenAddress(blockchain.account)}
                          </span>
                        </p>

                        {linkAddressMutation.error?.message && (
                          <p className="text-red-500 text-center text-sm">
                            {linkAddressMutation.error.message}
                          </p>
                        )}

                        <Button
                          onClick={() => {
                            linkAddressMutation.mutate(blockchain.account);
                          }}
                        >
                          Link Address
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant={"secondary"}
                        onClick={() => {
                          dispatch(connect());
                        }}
                      >
                        Connect Wallet
                      </Button>
                    )
                  ) : (
                    <a
                      href="https://metamask.io"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center space-x-3 bg-orange-500 shadow-center-lg shadow-orange-500 font-semibold text-white rounded-lg px-[1vw] py-[.8vh] text-[1.8vh]"
                    >
                      <div className="relative w-[3vh] h-[3vh]">
                        <img src="/metamask.svg" />
                      </div>
                      <span className="whitespace-nowrap">
                        Install Metamask →
                      </span>
                    </a>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

const editProfileFormSchema = z.object({
  name: z.string(),
  healthcareType: z.string(),
  organizationName: z.string(),
});

interface EditProfileFormProps extends React.HTMLAttributes<HTMLDivElement> {}

const EditProfileForm = ({ ...props }: EditProfileFormProps) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const error = useSelector((state: RootState) => state.auth.error);
  const response = useSelector((state: RootState) => state.auth.response);
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(false);

  const editForm = useForm<z.infer<typeof editProfileFormSchema>>({
    resolver: zodResolver(editProfileFormSchema),
    defaultValues: {
      name: user?.name || "",
      healthcareType: user?.healthcareType || "",
      organizationName: user?.organizationName || "",
    },
  });

  const hasChanged = useMemo(() => {
    return !editForm.formState.isDirty;
  }, [editForm.formState.isDirty]);

  useEffect(() => {
    editForm.reset({
      name: user?.name || "",
      healthcareType: user?.healthcareType || "",
      organizationName: user?.organizationName || "",
    });
  }, [user, editForm]);

  const onSubmit = (values: z.infer<typeof editProfileFormSchema>) => {
    setIsLoading(true);
    dispatch(setAuthError(""));

    setTimeout(async () => {
      await dispatch(updateDetails(values));

      setIsLoading(false);
    }, 1000);
  };

  return (
    <div {...props}>
      <Form {...editForm}>
        <form onSubmit={editForm.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl text-center">
                Profile Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <Label>Name</Label>
                    <FormControl>
                      <Input placeholder="" {...field} type="text" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="healthcareType"
                render={({ field }) => (
                  <FormItem>
                    <Label>Type of Healthcare Provider</Label>
                    <FormControl>
                      <Input placeholder="" {...field} type="text" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="organizationName"
                render={({ field }) => (
                  <FormItem>
                    <Label>Organization Name</Label>
                    <FormControl>
                      <Input placeholder="" {...field} type="text" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {response && (
                <p className="text-green-400 text-center text-sm">{response}</p>
              )}

              {error && (
                <p className="text-red-500 text-center text-sm">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={hasChanged}>
                {isLoading && (
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
                Update
              </Button>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
};
