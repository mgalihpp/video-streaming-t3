"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ImageCropper } from "@/components/ImageCropper";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { updateUserInputSchema } from "@/lib/schema/user";
import { Loader2 } from "lucide-react";
import { env } from "@/env";

interface CropImageModalProps {
  channel: {
    id: string;
    image?: string;
    backgroundImage?: string;
  };
  refetch: () => Promise<unknown>;
  imageType: "backgroundImage" | "image";
}

export default function SettingsPage() {
  const { data: sessionData } = useSession();

  const {
    data: channel,
    isLoading,
    isFetching,
    isFetched,

    refetch,
  } = api.user.getUserChannel.useQuery(
    {
      id: sessionData?.user.id ?? "",
    },
    {
      enabled: !!sessionData,
    },
  );

  const form = useForm<z.infer<typeof updateUserInputSchema>>({
    resolver: zodResolver(updateUserInputSchema),
    defaultValues: {
      name: channel?.user.name ?? "",
      handle: channel?.user.handle ?? "",
      image: channel?.user.image ?? "",
      backgroundImage: channel?.user.backgroundImage ?? "",
      description: channel?.user.description ?? "",
    },
  });

  const { mutate: updateUser, isPending } = api.user.updateUser.useMutation();

  useEffect(() => {
    if (channel) {
      form.setValue("name", channel.user.name ?? "");
      form.setValue("handle", channel.user.handle ?? "");
      form.setValue("description", channel.user.description ?? "");
    }
  }, [channel, form]);

  const handleSubmit = (data: z.infer<typeof updateUserInputSchema>) => {
    const userData = {
      name: channel?.user.name ?? undefined,
      // email: channel?.email,
      handle: channel?.user.handle ?? undefined,
      image: channel?.user.image ?? undefined,
      backgroundImage: channel?.user.backgroundImage ?? undefined,
      description: channel?.user.description ?? undefined,
    };

    if (
      data.name !== channel?.user.name ||
      data.description !== channel?.user.description ||
      data.handle !== channel?.user.handle
    ) {
      const newUserData = {
        ...userData,
      };
      if (data.name && data.name !== channel?.user.name)
        newUserData.name = data.name;
      if (data.description && data.description !== channel?.user.description)
        newUserData.description = data.description;
      if (data.handle && data.handle !== channel?.user.handle)
        newUserData.handle = data.handle;

      updateUser(newUserData, {
        onSuccess: () => {
          toast.success("Updated successfully");
          void refetch();
        },
        onError: () => {
          toast.error("Failed to update");
        },
      });
    }
  };

  if (isFetching && isLoading) {
    return (
      <div className="mx-auto flex w-full items-center justify-center">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  return (
    <>
      {!isFetching && isFetched && (
        <div>
          <div>
            <CropImageModal
              channel={{
                id: channel?.user.id ?? "",
                image: channel?.user.image ?? "",
                backgroundImage: channel?.user.backgroundImage ?? "",
              }}
              refetch={refetch}
              imageType="backgroundImage"
            />

            <div className="mx-auto mt-4 px-4 sm:px-6 lg:px-8">
              <div className="!-mt-6 items-center sm:-mt-16 sm:flex sm:space-x-5">
                <div className="flex items-center justify-center">
                  <CropImageModal
                    channel={{
                      id: channel?.user.id ?? "",
                      image: channel?.user.image ?? "",
                      backgroundImage: channel?.user.backgroundImage ?? "",
                    }}
                    refetch={refetch}
                    imageType="image"
                  />
                </div>
                <div className="mt-6 sm:flex sm:min-w-0 sm:flex-1 sm:items-center sm:justify-end sm:space-x-6 sm:pb-1">
                  <div className="mt-6 min-w-0 flex-1 sm:mt-0 sm:hidden md:block">
                    <h1 className="truncate text-center text-2xl font-bold text-primary sm:text-start">
                      {channel?.user.name ?? ""}
                    </h1>
                    <p className="text-regular text-primary/80">
                      {channel?.user.handle ?? ""}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <div className="space-y-10 divide-y divide-primary/5">
                <div className="grid grid-cols-1 gap-x-8 gap-y-8 pt-10 md:grid-cols-3">
                  <div className="px-4 sm:px-0">
                    <h2 className="text-base font-semibold leading-7 text-primary">
                      Personal Info
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-primary/80">
                      Update your photo and personal details.
                    </p>
                  </div>

                  <div className="bg-background shadow-sm ring-1 ring-primary/5 sm:rounded-xl md:col-span-2">
                    <div className="px-4 py-6 sm:p-8">
                      <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                        <div className="sm:col-span-3">
                          <label
                            htmlFor="name"
                            className="block text-sm font-medium leading-6 text-primary"
                          >
                            Name
                          </label>
                          <div className="mt-2">
                            <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <input
                                      {...field}
                                      autoComplete="family-name"
                                      className="focus:ring-primary-600 block w-full rounded-md border-0 bg-secondary p-2 py-1.5 text-primary shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        <div className="sm:col-span-4">
                          <label
                            htmlFor="email"
                            className="block text-sm font-medium leading-6 text-primary"
                          >
                            Email address
                          </label>
                          <div className="mt-2">
                            <input
                              id="email"
                              name="email"
                              type="email"
                              autoComplete="email"
                              value={channel?.user.email ?? ""}
                              readOnly
                              className="focus:ring-primary-600 block w-full rounded-md border-0 bg-secondary p-2 py-1.5 text-primary shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
                  <div className="mt-4 px-4 sm:px-0">
                    <h2 className="text-base font-semibold leading-7 text-primary">
                      Profile
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-primary/80">
                      This information will be displayed publicly so be careful
                      what you share.
                    </p>
                  </div>
                  <div className="mt-4 bg-background shadow-sm ring-1 ring-primary/5 sm:rounded-xl md:col-span-2">
                    <div className="px-4 py-6 sm:p-8">
                      <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                        <div className="sm:col-span-4">
                          <label
                            htmlFor="handle"
                            className="block text-sm font-medium leading-6 text-primary"
                          >
                            Handle
                          </label>
                          <div className="mt-2">
                            <div className="flex w-full items-center rounded-md bg-secondary shadow-sm ring-1 ring-inset ring-primary focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary sm:max-w-md">
                              <span className="flex select-none items-center text-nowrap pl-3 text-primary/70 sm:text-sm">
                                YourTube .com/
                              </span>
                              <FormField
                                control={form.control}
                                name="handle"
                                render={({ field }) => (
                                  <FormItem className="w-full">
                                    <FormControl>
                                      <input
                                        {...field}
                                        className="block w-full border-0 bg-transparent py-1.5 pl-1 text-primary placeholder:text-primary focus:outline-none focus:ring-0 sm:text-sm sm:leading-6"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="col-span-full">
                          <label
                            htmlFor="description"
                            className="block text-sm font-medium leading-6 text-primary"
                          >
                            About
                          </label>
                          <div className="mt-2">
                            <FormField
                              control={form.control}
                              name="description"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <textarea
                                      {...field}
                                      rows={3}
                                      className="block w-full rounded-md border-0 bg-secondary p-2 py-1.5 text-primary shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-primary focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <p className="mt-3 text-sm leading-6 text-primary/80">
                            Write a few sentences about yourself.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-x-6 border-t border-primary/5 px-4 py-4 sm:px-8">
                      <Button type="submit" disabled={isPending}>
                        Save
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </Form>
          <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
            <div className="mt-4 px-4 sm:px-0">
              <h1 className="text-base font-semibold leading-7 text-primary">
                Preferences
              </h1>
              <p className="mt-1 text-sm leading-6 text-primary/80">
                Change theme.
              </p>
            </div>
            <div className="mt-4 bg-background shadow-sm ring-1 ring-primary/5 sm:rounded-xl md:col-span-2">
              <div className="px-4 py-6 sm:p-8">
                <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                  <div className="sm:col-span-4">
                    <SelecTheme />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const CropImageModal: React.FC<CropImageModalProps> = ({
  channel,
  refetch,
  imageType,
}) => {
  const [image, setImage] = useState<File | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const { mutate: updateUser } = api.user.updateUser.useMutation();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImage(e.target.files[0] ? e.target.files[0] : null);
      setOpen(true);
    }
  };

  const handleSubmit = (croppedDataUrl: string) => {
    type UploadResponse = {
      secure_url: string;
    };

    type UserData = {
      name?: string;
      image?: string;
      backgroundImage?: string;
      handle?: string;
      description?: string;
    };

    const userData = {
      id: channel.id,
      [imageType]: channel[imageType] ?? undefined,
    };
  
    const cloudName = env.NEXT_PUBLIC_CLOUDINARY_NAME;

    const formData = new FormData();
    formData.append("upload_preset", "ml_image");
    formData.append("file", croppedDataUrl);

    fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json() as Promise<UploadResponse>)
      .then((data) => {
        if (data.secure_url !== undefined) {
          const newUserData: UserData & { id: string } = {
            ...userData,
            ...(data.secure_url && { [imageType]: data.secure_url }),
          };
          updateUser(newUserData, {
            onSuccess: () => {
              setOpen(false);
              void refetch();
              setImage(null);
              setCroppedImage(null);
            },
          });
        }
      })
      .catch((error) => {
        toast.error("Failed to update image");
        console.error("An error occurred:", error);
      });
  };

  return (
    <>
      {imageType === "image" ? (
        <label htmlFor="file-upload-image">
          <input
            type="file"
            name="image"
            id="file-upload-image"
            className="sr-only"
            onChange={onFileChange}
          />
          <Image
            priority
            className="h-24 w-24 rounded-full ring-4 ring-white sm:h-32 sm:w-32"
            width={2000}
            height={2000}
            src={channel.image ?? "/profile.jpg"}
            alt="user profile"
          />
        </label>
      ) : (
        <>
          <label htmlFor="file-upload-backgroundImage">
            <input
              id="file-upload-backgroundImage"
              name="backgroundImage"
              type="file"
              className="sr-only"
              onChange={onFileChange}
            />
            <Image
              priority
              className="h-32 w-full object-cover lg:h-64"
              src={channel.backgroundImage ?? "/background.jpg"}
              width={2000}
              height={2000}
              alt="error"
            />
          </label>
        </>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-screen overflow-y-auto overflow-x-hidden">
          <>
            <ImageCropper
              image={image}
              setCroppedImage={setCroppedImage}
              imageType={imageType}
              handleSubmit={handleSubmit}
              setOpen={setOpen}
            />
          </>
        </DialogContent>
      </Dialog>
    </>
  );
};

const SelecTheme = () => {
  const { setTheme } = useTheme();

  const FormSchema = z.object({
    theme: z
      .string()
      .refine(
        (value) => value === "light" || value === "dark" || value === "system",
        {
          message: 'Theme must be either "light" or "dark"',
        },
      ),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      theme: "light",
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    setTheme(data.theme);
    toast.success(`You changed theme to: ${data.theme}`);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
        <FormField
          control={form.control}
          name="theme"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Theme</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a theme you likes" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>You can manage theme</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};
