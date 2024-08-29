import { motion } from "framer-motion";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addCommentInputSchema } from "@/lib/schema/comment";
import { api } from "@/trpc/react";
import { type z } from "zod";
import { toast } from "sonner";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Input } from "../ui/input";
import { lazy, Suspense, useState } from "react";
import { Smile } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const EmojiPicker = lazy(() => import("emoji-picker-react"));

interface VideoCommentFormProps {
  videoId: string;
  parentId?: string;
  reply?: boolean;
  refetch: () => Promise<unknown>;
  cb?: (state: boolean) => void;
}

export const VideoCommentForm = ({
  videoId,
  parentId,
  reply,
  refetch,
  cb,
}: VideoCommentFormProps) => {
  const { data: sessionData } = useSession();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [emojiOpen, setEmojiOpen] = useState(false);

  const router = useRouter();

  const form = useForm<z.infer<typeof addCommentInputSchema>>({
    resolver: zodResolver(addCommentInputSchema),
    defaultValues: {
      message: "",
      videoId: videoId,
      parentId: reply ? parentId : null,
    },
  });

  const { mutate: addComment, isPending } =
    api.comment.addComment.useMutation();

  function onCreateComment(data: z.infer<typeof addCommentInputSchema>) {
    if (!sessionData) {
      toast.error("Please sign in to comment");
      router.push("/login");
      return;
    }

    addComment(data, {
      onSuccess: () => {
        form.reset();
        setEmojiOpen(false);
        cb?.(false);
        refetch().catch(() => {
          toast.error("Failed to refetch comments");
        });
      },
      onError: (err) => {
        toast.error(`Error: ${err.message}`);
      },
    });
  }

  return (
    <Form {...form}>
      <motion.form
        onSubmit={form.handleSubmit(onCreateComment)}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                {isDesktop ? (
                  <div className="relative">
                    <Input
                      autoFocus={reply}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      placeholder="Type a message"
                      autoComplete="off"
                    />
                    <div className="absolute right-0 top-28 z-10">
                      <Suspense>
                        <EmojiPicker
                          lazyLoadEmojis
                          open={emojiOpen}
                          onEmojiClick={(emoji) => {
                            form.setValue(
                              "message",
                              field.value + emoji.emoji,
                              {
                                shouldValidate: true,
                              },
                            );
                          }}
                        />
                      </Suspense>
                    </div>
                  </div>
                ) : (
                  <Textarea
                    {...field}
                    autoFocus={reply}
                    placeholder="Type a message"
                  />
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="mt-4 flex w-full justify-end">
          <Button
            type="button"
            aria-label="Emoji Button"
            variant="transparent"
            className="group max-md:hidden"
            onClick={() => setEmojiOpen(!emojiOpen)}
          >
            <div className="flex items-center rounded-full p-2 group-hover:bg-accent">
              <Smile className="size-5" />
            </div>
          </Button>

          <Button disabled={isPending || form.watch("message").length <= 1}>
            Comment
          </Button>
        </div>
      </motion.form>
    </Form>
  );
};
