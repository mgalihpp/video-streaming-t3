"use client";

import useDocumentTitle from "@/hooks/useDocumentTitle";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function VideoPage() {
  const videoId = useSearchParams().get("watch");
  const { data: sessionData } = useSession();

  const { data, isLoading, error, refetch } = api.video.getVideoById.useQuery(
    {
      id: videoId!,
      viewerId: sessionData?.user.id,
    },
    {
      enabled: !!videoId && !!sessionData?.user.id,
    },
  );

  const title = `${data?.video.title ?? "Video App"}`;
  const description = `${data?.video.description ?? " "}`;

  useDocumentTitle({ title: title, description: description });

  return <div>helloworld</div>;
}
