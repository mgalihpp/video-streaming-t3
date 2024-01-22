"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Switch } from "@headlessui/react";

interface PublishButton {
  video: {
    id: string;
    publish: boolean;
  };
}

export default function PublishButton({ video }: PublishButton) {
  const [userChoice, setUserChoice] = useState({
    publish: video.publish,
  });

  const updatePublishVideoMutation = api.video.publishVideo.useMutation();

  const handlePublishVideo = (input: string) => {
    if (userChoice.publish) {
      setUserChoice({
        publish: false,
      });
    } else {
      setUserChoice({
        publish: true,
      });
    }
    updatePublishVideoMutation.mutate(input);
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center">
        <div className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
          <Switch
            checked={userChoice.publish}
            onChange={() => handlePublishVideo(video.id)}
            className={`${
              userChoice.publish ? "bg-primary" : "bg-gray-200"
            } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
          >
            <span
              className={`${
                userChoice.publish ? "translate-x-5" : "translate-x-0"
              } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
            ></span>
          </Switch>
        </div>
        <div className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
          {userChoice.publish ? (
            <span className="inline-flex items-center rounded-full border border-green-700 px-2 py-1 text-xs font-medium text-green-700">
              Published
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full border border-red-700 px-2 py-1 text-xs font-medium text-red-700">
              Unpublished
            </span>
          )}
        </div>
      </div>
    </>
  );
}
