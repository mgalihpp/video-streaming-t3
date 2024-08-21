"use client";

import { SmallSingleColumnVideo } from "@/components/video/SmallSingleColumnVideo";
import { api } from "@/trpc/react";
import { useSearchParams } from "next/navigation";

export default function SearchPage() {
  const searchQuery = useSearchParams().get("q");

  const { data, isLoading } = api.video.getVideoBySearch.useQuery({
    title: searchQuery ?? "",
  });

  return (
    <>
      {isLoading ? (
        <></>
      ) : (
        data && (
          <SmallSingleColumnVideo
            videos={data.videos}
            users={data.videos.map((video) => video.user)}
          />
        )
      )}
    </>
  );
}
