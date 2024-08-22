"use client";

import { Button } from "@/components/ui/button";
import { type ChangeEvent, useEffect, useState } from "react";
import { api } from "@/trpc/react";
import { Separator } from "@/components/ui/separator";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
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
import { type z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createNewPlaylistInputSchema } from "@/lib/schema/playlist";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import FolderPlus from "@/components/Icons/FolderPlus";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";

export default function SaveButton({ videoId }: { videoId: string }) {
  const { data: sessionData } = useSession();
  const [open, setOpen] = useState(false);
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [checkedStatus, setCheckedStatus] = useState<Record<string, boolean>>(
    {},
  );
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const { data: playlists, refetch: refetchPlaylists } =
    api.playlist.getPlaylists.useQuery(undefined, {
      enabled: !!sessionData,
    });

  useEffect(() => {
    if (videoId && open) {
      void refetchPlaylists();
      const initialCheckedStatus: Record<string, boolean> = {};
      playlists?.forEach((playlist) => {
        initialCheckedStatus[playlist.id] = playlist.PlaylistHasVideo.some(
          (videoItem) => videoItem.videoId === videoId,
        );
      });
      setCheckedStatus(initialCheckedStatus);
    }
  }, [open, videoId]);

  const handleAddVideoToPlaylist = (
    e: ChangeEvent<HTMLInputElement>,
    input: { playlistId: string; videoId: string },
  ) => {
    addVideoToPlaylist(input, {
      onSuccess: () => {
        toast.success(
          checkedStatus[input.playlistId]
            ? "Remove video from playlist"
            : "Added video to playlist",
        );
        void refetchPlaylists();
      },
      onError: (err) => {
        toast.error(`Error: ${err.message}`);
      },
    });
    setCheckedStatus({
      ...checkedStatus,
      [input.playlistId]: e.target.checked,
    });
  };

  const form = useForm<z.infer<typeof createNewPlaylistInputSchema>>({
    resolver: zodResolver(createNewPlaylistInputSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const { mutate: addPlaylist, isPending } =
    api.playlist.addPlaylist.useMutation();

  const { mutate: addVideoToPlaylist, isPending: addVideoToPlaylistPending } =
    api.playlist.addVideoToPlaylist.useMutation();

  const OnCreatePlaylist = (
    data: z.infer<typeof createNewPlaylistInputSchema>,
  ) => {
    addPlaylist(data, {
      onSuccess: (data) => {
        form.reset();
        toast.success(`Created new playlist ${data.title}`);
        setIsCreatingPlaylist(false);
        void refetchPlaylists();
      },
      onError: (err) => {
        toast.error(`Error: ${err.message}`);
      },
    });
  };

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="gap-1"
            onClick={(e) => {
              if (!sessionData) {
                e.preventDefault();
                toast.error("You must be logged in to save videos");
                return;
              }
            }}
          >
            <FolderPlus className="size-5 shrink-0 stroke-primary" />
            Save
          </Button>
        </DialogTrigger>
        {isCreatingPlaylist ? (
          <DialogContent className="max-h-screen overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create new playlist</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                className="space-y-4"
                onSubmit={form.handleSubmit(OnCreatePlaylist)}
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Title" {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter the title of the playlist
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Description"
                          className="max-h-96 min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the description of the playlist (optional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button aria-label="Save" disabled={isPending}>
                    Save
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setIsCreatingPlaylist(false)}
                    aria-label="Cancel"
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        ) : (
          <DialogContent className="max-h-screen max-w-xs overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Save video to...</DialogTitle>
            </DialogHeader>

            <div
              className={cn(
                "flex w-full flex-col items-start gap-2 text-start",
                {
                  "pointer-events-none opacity-50": addVideoToPlaylistPending,
                },
              )}
            >
              {playlists?.map((playlist) => (
                <div className="flex items-center gap-2" key={playlist.id}>
                  <input
                    type="checkbox"
                    className="h-5 w-5 shrink-0 rounded-lg accent-primary disabled:cursor-not-allowed disabled:opacity-50 dark:accent-secondary"
                    id="playlist"
                    name={playlist.title}
                    checked={checkedStatus[playlist.id] ?? false}
                    onChange={(e) => {
                      e.preventDefault();

                      handleAddVideoToPlaylist(e, {
                        playlistId: playlist.id,
                        videoId: videoId,
                      });
                    }}
                  />
                  <label
                    htmlFor="playlist"
                    className="text-base font-medium leading-6 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {playlist.title}
                  </label>
                </div>
              ))}
              {addVideoToPlaylistPending && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50">
                  <Loader2 className="size-4 animate-spin" />
                </div>
              )}
            </div>
            <Separator />

            <Button
              type="button"
              onClick={() => setIsCreatingPlaylist(true)}
              className="w-full"
              aria-label="Toggle Create Playlist"
            >
              Create new playlist
            </Button>
          </DialogContent>
        )}
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="gap-1">
          <FolderPlus className="size-5 shrink-0 stroke-primary" />
          Save
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        {isCreatingPlaylist ? (
          <div className="mx-auto w-full max-w-md px-4">
            <DrawerHeader>
              <DrawerTitle>Create new playlist</DrawerTitle>
            </DrawerHeader>
            <Form {...form}>
              <form
                className="space-y-4"
                onSubmit={form.handleSubmit(OnCreatePlaylist)}
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Title" {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter the title of the playlist
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Description"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the description of the playlist (optional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DrawerFooter>
                  <Button aria-label="Save" disabled={isPending}>
                    Save
                  </Button>
                  <Button
                    type="button"
                    aria-label="Cancel"
                    variant="outline"
                    onClick={() => setIsCreatingPlaylist(false)}
                  >
                    Cancel
                  </Button>
                </DrawerFooter>
              </form>
            </Form>
          </div>
        ) : (
          <div className="mx-auto h-full w-full max-w-md px-4">
            <DrawerHeader>
              <DrawerTitle>Save video to...</DrawerTitle>
            </DrawerHeader>

            <div className="flex w-full flex-col gap-2 text-start">
              {playlists?.map((playlist) => (
                <div className="flex items-center gap-2" key={playlist.id}>
                  <input
                    type="checkbox"
                    className="h-5 w-5 shrink-0 rounded-lg accent-primary disabled:cursor-not-allowed disabled:opacity-50 dark:accent-secondary"
                    id="playlist"
                    name={playlist.title}
                    checked={checkedStatus[playlist.id] ?? false}
                    onChange={(e) => {
                      e.preventDefault();

                      handleAddVideoToPlaylist(e, {
                        playlistId: playlist.id,
                        videoId: videoId,
                      });
                    }}
                  />
                  <label
                    htmlFor="playlist"
                    className="text-base font-medium leading-6 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {playlist.title}
                  </label>
                </div>
              ))}
            </div>
            <Separator />

            <Button
              type="button"
              onClick={() => setIsCreatingPlaylist(true)}
              className="my-8 w-full"
              aria-label="Toggle Create Playlist"
            >
              Create new playlist
            </Button>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
