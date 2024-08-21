"use client";

import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { createAnnoucementInputSchema } from "@/lib/schema/annoucement";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import EmojiPicker from "emoji-picker-react";
import { Smile } from "lucide-react";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";
import { useRouter } from "next/navigation";

export const AnnoucementForm = () => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [emojiOpen, setEmojiOpen] = useState(false);

  const router = useRouter();

  const { mutate: createAnnoucement, isPending } =
    api.annoucement.addAnnoucement.useMutation();

  const form = useForm<z.infer<typeof createAnnoucementInputSchema>>({
    resolver: zodResolver(createAnnoucementInputSchema),
    defaultValues: {
      message: "",
    },
  });

  function oncreateAnnoucement(
    data: z.infer<typeof createAnnoucementInputSchema>,
  ) {
    createAnnoucement(data, {
      onSuccess: () => {
        form.reset();
        toast.success("Annoucement created successfully");
        router.refresh();
      },
      onError: (err) => {
        toast.error(`Error: ${err.message}`);
      },
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(oncreateAnnoucement)}>
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                {isDesktop ? (
                  <div className="relative">
                    <Textarea
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      placeholder="Type a message"
                      autoComplete="off"
                    />
                    <div className="absolute right-0 top-36 z-10">
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
                  <Textarea {...field} placeholder="Type a message" />
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
      </form>
    </Form>
  );
};
