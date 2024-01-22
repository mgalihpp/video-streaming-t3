"use client";

import { useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { RedTrash, Trash } from "../Icons/Icons";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { DialogDescription } from "@radix-ui/react-dialog";
import { Loader2 } from "lucide-react";
import { useToast } from "../ui/use-toast";
export default function DeleteButton({ videoId }: { videoId: string }) {
  const [open, setOpen] = useState(false);
  const [disable, setDisable] = useState(false);

  const router = useRouter();
  const { toast } = useToast();
  const deleteVideoMutation = api.video.deleteVideo.useMutation();

  const handleDeleteVideo = (input: string) => {
    setDisable(true);
    deleteVideoMutation.mutate(input, {
      onSuccess: () => {
        toast({
          title: "Success Deleted Video",
          variant: "success",
        });
        setOpen(false);
        setDisable(false);
        router.refresh();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size='icon'>
          <Trash className="h-5 w-5 shrink-0 !stroke-red-500" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <div className="flex flex-row items-center justify-center space-x-4">
          <RedTrash className="mx-auto" />
          <DialogHeader className="text-start">
            <DialogTitle>Delete Video</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this video? Once its deleted, you
              cannot be able to recover it.
            </DialogDescription>
          </DialogHeader>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="destructive"
            disabled={disable}
            onClick={() => handleDeleteVideo(videoId)}
          >
            {disable ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Yes, Delete it!"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
