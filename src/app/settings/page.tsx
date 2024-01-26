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
import { setTheme } from "@/store/theme";
import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { z } from "zod";
import { useToast } from "@/components/ui/use-toast";
import { env } from "@/env";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ImageCropper } from "@/components";

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
  const [disable, setDisable] = useState(false);

  const [inputData, setInputData] = useState({
    name: "",
    handle: "",
    description: "",
  });

  const { data, isLoading, refetch } = api.user.getChannelById.useQuery({
    id: sessionData?.user.id ?? "",
  });

  const updateUserMutation = api.user.updateUser.useMutation();

  const { toast } = useToast();

  const channel = data?.user;

  const errorTypes = !data ?? !channel;

  // useEffect(() => {
  //   if (sessionData?.user.id) {
  //     router.replace(`/settings?${sessionData?.user.id}`);
  //   }
  // }, [router, sessionData?.user.id]);

  useEffect(() => {
    if (channel) {
      setInputData({
        name: channel.name ?? "",
        handle: channel.handle ?? "",
        description: channel.description ?? "",
      });
    }
  }, [channel]);

  if (errorTypes || isLoading) {
    return (
      <Loader2 className="flex h-5 w-5 animate-spin items-center justify-center" />
    );
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    setInputData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = () => {
    setDisable(true);

    const userData = {
      name: channel?.name ?? undefined,
      // email: channel?.email,
      handle: channel?.handle ?? undefined,
      image: channel?.image ?? undefined,
      backgroundImage: channel?.backgroundImage ?? undefined,
      description: channel?.description ?? undefined,
    };

    if (
      inputData.name !== channel?.name ||
      inputData.description !== channel?.description ||
      inputData.handle !== channel?.handle
    ) {
      const newUserData = {
        ...userData,
      };
      if (inputData.name && inputData.name !== channel?.name)
        newUserData.name = inputData.name;
      if (
        inputData.description &&
        inputData.description !== channel?.description
      )
        newUserData.description = inputData.description;
      if (inputData.handle && inputData.handle !== channel?.handle)
        newUserData.handle = inputData.handle;

      updateUserMutation.mutate(newUserData, {
        onSuccess: () => {
          toast({
            title: "Profile update",
          });
          void refetch();
          setDisable(false);
        },
        onError: () => {
          setDisable(false);
        },
      });
    }
  };

  return (
    <>
      <div>
        <CropImageModal
          channel={{
            id: channel?.id ?? "",
            image: channel?.image ?? "",
            backgroundImage: channel?.backgroundImage ?? "/background.jpg",
          }}
          refetch={refetch}
          imageType="backgroundImage"
        />

        <div className="mx-auto mt-4 px-4 sm:px-6 lg:px-8">
          <div className="!-mt-6 sm:-mt-16 sm:flex sm:items-end sm:space-x-5">
            <div className="flex items-center justify-center">
              <CropImageModal
                channel={{
                  id: channel?.id ?? "",
                  image: channel?.image ?? "",
                  backgroundImage: channel?.backgroundImage ?? "",
                }}
                refetch={refetch}
                imageType="image"
              />
            </div>
            <div className="mt-6 sm:flex sm:min-w-0 sm:flex-1 sm:items-center sm:justify-end sm:space-x-6 sm:pb-1">
              <div className="mt-6 min-w-0 flex-1 sm:hidden md:block">
                <h1 className="truncate text-2xl font-bold text-primary">
                  {channel?.name}
                </h1>
                <p className="text-regular text-primary/80">
                  {channel?.handle}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
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

          <form className="bg-background shadow-sm ring-1 ring-primary/5 sm:rounded-xl md:col-span-2">
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
                    <input
                      type="text"
                      name="name"
                      id="name"
                      autoComplete="family-name"
                      value={inputData?.name || ""}
                      onChange={handleInputChange}
                      className="focus:ring-primary-600 block w-full rounded-md border-0 bg-secondary p-2 py-1.5 text-primary shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
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
                      value={channel?.email ?? ""}
                      className="focus:ring-primary-600 block w-full rounded-md border-0 bg-secondary p-2 py-1.5 text-primary shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
          <div className="mt-4 px-4 sm:px-0">
            <h2 className="text-base font-semibold leading-7 text-primary">
              Profile
            </h2>
            <p className="mt-1 text-sm leading-6 text-primary/80">
              This information will be displayed publicly so be careful what you
              share.
            </p>
          </div>
          <form className="mt-4 bg-background shadow-sm ring-1 ring-primary/5 sm:rounded-xl md:col-span-2">
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
                    <div className="flex rounded-md bg-secondary shadow-sm ring-1 ring-inset ring-primary focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary sm:max-w-md">
                      <span className="flex select-none items-center pl-3 text-primary/70 sm:text-sm">
                        YourTube .com/
                      </span>
                      <input
                        type="text"
                        name="handle"
                        id="handle"
                        className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-primary placeholder:text-primary focus:outline-none focus:ring-0 sm:text-sm sm:leading-6"
                        value={inputData?.handle || ""}
                        onChange={handleInputChange}
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
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      className="block w-full rounded-md border-0 bg-secondary p-2 py-1.5 text-primary shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-primary focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                      value={inputData?.description || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-primary/80">
                    Write a few sentences about yourself.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-x-6 border-t border-primary/5 px-4 py-4 sm:px-8">
              <Button
                type="button"
                onClick={() => handleSubmit()}
                disabled={disable}
              >
                Save
              </Button>
            </div>
          </form>
        </div>
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
                  <SelecForm />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
  const updateUserMutation = api.user.updateUser.useMutation();
  const cloudinaryName = env.NEXT_PUBLIC_CLOUDINARY_NAME ?? "";

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

    const formData = new FormData();
    formData.append("upload_preset", "user_uploads");
    formData.append("file", croppedDataUrl);

    fetch(
      "https://api.cloudinary.com/v1_1/" + cloudinaryName + "/image/upload",
      {
        method: "POST",
        body: formData,
      },
    )
      .then((response) => response.json() as Promise<UploadResponse>)
      .then((data) => {
        if (data.secure_url !== undefined) {
          const newUserData: UserData & { id: string } = {
            ...userData,
            ...(data.secure_url && { [imageType]: data.secure_url }),
          };
          updateUserMutation.mutate(newUserData, {
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

const SelecForm = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
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
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    dispatch(setTheme(data.theme));
    toast({
      title: "You change theme to:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-secondary p-4">
          <code className="text-primary">
            {JSON.stringify(data.theme, null, 2)}
          </code>
        </pre>
      ),
    });
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
