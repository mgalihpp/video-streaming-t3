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

export default function SaveButton({ videoId }: { videoId: string }) {
  const { data: sessionData } = useSession();
  const [open, setOpen] = useState(false);
  const [createNewOpen, setCreateNewOpen] = useState(false);
  const [checkedStatus, setCheckedStatus] = useState<{
    [key: string]: boolean;
  }>({});
  const [formData, setFormData] = useState<{ title: string; desc: string }>({
    title: "",
    desc: "",
  });
  const [errorInput, setErrorInput] = useState(false);
  const [errorInputMsg, setErrorInputMsg] = useState<{
    [key: string]: string;
  }>({});
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
      const initialCheckedStatus: { [key: string]: boolean } = {};
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

    const description =
      formData.desc && formData.desc.length > 5 ? formData.desc : undefined;

    addNewPlaylistMutation.mutate(
      {
        title: formData.title,
        description: description,
      },
      {
        onError: (err) => {
          if (err.data?.code === "BAD_REQUEST") {
            const fieldErrors = err?.data?.zodError?.fieldErrors ?? {};

            const errorObject: { [key: string]: string } = Object.entries(
              fieldErrors,
            ).reduce((acc: { [key: string]: string }, [fieldName, errors]) => {
              if (errors) {
                acc[fieldName] = errors.join(", ");
              }
              return acc;
            }, {});

            //error valid
            setErrorInput(true);
            setErrorInputMsg(errorObject);
          }
        },
        onSuccess: () => {
          void refetchPlaylists()
          toast({ title: `Created new playlist ${formData.title}` }),
            setFormData({
              title: "",
              desc: "",
            });
          setErrorInput(false);
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
            <FolderPlus className="mr-2 h-5 w-5 shrink-0 stroke-gray-600" />{" "}
            Save
          </Button>
        </DialogTrigger>
        <DialogContent className="rounded-2xl max-w-xs">
          <DialogHeader>
            <DialogTitle>Save video to...</DialogTitle>
          </DialogHeader>
          <div className="w-full flex flex-col items-start text-start">
            {playlists?.map((playlist) => (
              <div className="flex gap-2 items-center" key={playlist.id}>
                <input
                  type="checkbox"
                  className="h-5 w-5 shrink-0 accent-primary rounded-lg disabled:cursor-not-allowed disabled:opacity-50"
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
              <div className="w-full space-y-4 flex flex-col">
                <div className="w-full flex flex-col gap-2">
                  <Label>Name</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    placeholder="Input playlist name"
                    onChange={handleChange}
                  />
                  {errorInput && errorInputMsg.title && (
                    <p className="text-destructive text-xs">
                      {errorInputMsg.title}
                    </p>
                  )}
                  <Label>Description</Label>
                  <Input
                    id="desc"
                    name="desc"
                    value={formData.desc}
                    placeholder="Input playlist descrition. (optional)"
                    onChange={handleChange}
                  />
                  {errorInput && errorInputMsg.description && (
                    <p className="text-destructive text-xs">
                      {errorInputMsg.description}
                    </p>
                  )}
                </div>
                <Button type="submit">Create</Button>
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
