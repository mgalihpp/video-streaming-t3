"use client";

import { signIn, useSession } from "next-auth/react";
import { Button } from "../ui/button";
import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import { FolderPlus } from "../Icons/Icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { useToast } from "../ui/use-toast";
import { api } from "@/trpc/react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import { Loader2 } from "lucide-react";

export default function SaveButton({ videoId }: { videoId: string }) {
  const { data: sessionData } = useSession();
  const [open, setOpen] = useState(false);
  const [disable, setDisable] = useState(false);
  const [createNewOpen, setCreateNewOpen] = useState(false);
  const [checkedStatus, setCheckedStatus] = useState<Record<string, boolean>>(
    {},
  );
  const [formData, setFormData] = useState<Record<string, string>>({
    title: "",
    desc: "",
  });
  const [errorInput, setErrorInput] = useState(false);
  const [errorInputMsg, setErrorInputMsg] = useState<Record<string, string>>(
    {},
  );
  const { toast } = useToast();

  const { data: playlists, refetch: refetchPlaylists } =
    api.playlist.getSavePlaylistData.useQuery(undefined, {
      enabled: false,
    });

  const addVideoToPlaylistMutation = api.video.addVideoToPlaylist.useMutation();
  const addNewPlaylistMutation = api.playlist.addPlaylist.useMutation();

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

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAddVideoToPlaylist = (
    e: ChangeEvent<HTMLInputElement>,
    input: { playlistId: string; videoId: string },
  ) => {
    addVideoToPlaylistMutation.mutate(input);
    setCheckedStatus({
      ...checkedStatus,
      [input.playlistId]: e.target.checked,
    });
  };

  const handleAddNewPlaylist = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setDisable(true);

    const description =
      formData.desc && formData.desc.length > 5 ? formData.desc : undefined;

    addNewPlaylistMutation.mutate(
      {
        title: formData.title!,
        description: description,
      },
      {
        onError: (err) => {
          if (err.data?.code === "BAD_REQUEST") {
            const fieldErrors = err?.data?.zodError?.fieldErrors ?? {};

            const errorObject: Record<string, string> = Object.entries(
              fieldErrors,
            ).reduce((acc: Record<string, string>, [fieldName, errors]) => {
              if (errors) {
                acc[fieldName] = errors.join(", ");
              }
              return acc;
            }, {});

            //error valid
            setErrorInput(true);
            setErrorInputMsg(errorObject);
            setDisable(false);
          }
        },
        onSuccess: () => {
          void refetchPlaylists();
          toast({ title: `Created new playlist ${formData.title}` }),
            setFormData({
              title: "",
              desc: "",
            });
          setDisable(false);
          setErrorInput(false);
          setCreateNewOpen(false);
        },
      },
    );
  };

  const handleCreateNewPlaylistClick = () => {
    setCreateNewOpen(!createNewOpen);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              sessionData?.user.id ? void setOpen(true) : void signIn()
            }
          >
            <FolderPlus className="mr-2 h-5 w-5 shrink-0 stroke-primary" /> Save
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-xs rounded-2xl">
          <DialogHeader>
            <DialogTitle>Save video to...</DialogTitle>
          </DialogHeader>
          <div className="flex w-full flex-col items-start gap-2 text-start">
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

                    toast({
                      title: checkedStatus[playlist.id]
                        ? `Remove Video from ${playlist.title}`
                        : `Added Video to ${playlist.title}`,
                      variant: checkedStatus[playlist.id]
                        ? "destructive"
                        : "default",
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
          {createNewOpen ? (
            <form onSubmit={handleAddNewPlaylist}>
              <div className="flex w-full flex-col space-y-4">
                <div className="flex w-full flex-col gap-2">
                  <Label htmlFor="title">Name</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    placeholder="Input playlist name"
                    onChange={handleChange}
                  />
                  {errorInput && errorInputMsg.title && (
                    <p className="text-xs text-destructive">
                      {errorInputMsg.title}
                    </p>
                  )}
                  <Label htmlFor="desc">Description</Label>
                  <Input
                    id="desc"
                    name="desc"
                    value={formData.desc}
                    placeholder="Input playlist descrition. (optional)"
                    onChange={handleChange}
                  />
                  {errorInput && errorInputMsg.description && (
                    <p className="text-xs text-destructive">
                      {errorInputMsg.description}
                    </p>
                  )}
                </div>
                <Button type="submit" disabled={disable}>
                  {disable ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Create"
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <Button
              type="button"
              className="w-full"
              onClick={handleCreateNewPlaylistClick}
            >
              Create new playlist
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
