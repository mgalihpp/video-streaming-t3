"use client";

import { api } from "@/trpc/react";
import { type FormEvent, useState } from "react";
import { Button } from "../ui/button";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const AddAnnoucementForm = () => {
  const [input, setInput] = useState("");
  const [disable, setDisable] = useState(false);
  const [errorInput, setErrorInput] = useState(false);
  const [errorInputMsg, setErrorInputMsg] = useState<
    string | string[] | undefined
  >("");

  const { data: sessionData } = useSession();
  const router = useRouter();

  const addAnnoucementMutation = api.annoucement.addAnnoucement.useMutation();

  const handleAnnoucement = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setDisable(true);

    addAnnoucementMutation.mutate(input, {
      onError: (err) => {
        if (err.data?.code === "BAD_REQUEST") {
          setErrorInput(true);
          setErrorInputMsg(err.data.zodError?.formErrors);
        }
        setDisable(false);
      },
      onSuccess: () => {
        setInput("")
        setErrorInput(false);
        setErrorInputMsg("");
        setDisable(false);
        router.refresh();
      },
    });
  };

  return (
    <>
      <form onSubmit={handleAnnoucement}>
        <div className="mt-2 flex flex-row gap-2">
          <div className="w-full">
            <textarea
              rows={1}
              maxLength={200}
              name="annoucement"
              id="annoucement"
              placeholder="Add annoucement"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="block w-full rounded-md border-0 p-4 py-1.5 text-primary dark:bg-secondary ring-1 ring-inset ring-gray-200"
            />
          </div>
          <div className="flex-shrink-0">
            <Button
              aria-label="add annoucement"
              disabled={disable}
              onClick={() => (sessionData?.user.id ? void {} : void signIn())}
            >
              Post
            </Button>
          </div>
        </div>
        {errorInput && (
          <p className="text-sm text-destructive">{errorInputMsg}</p>
        )}
      </form>
    </>
  );
};

export default AddAnnoucementForm;
