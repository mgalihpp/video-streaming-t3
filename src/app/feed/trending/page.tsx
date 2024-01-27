"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { TrendingUp } from "lucide-react";
import { api } from "@/trpc/react";
import {
  LoadingMessage,
  ErrorMessage,
  MultiColumnVideo,
} from "@/components";
import { useEffect } from "react";

export default function TrendingPage() {
  const pathname = usePathname();
  const v = useSearchParams().get("v");

  const { data, isLoading, error, refetch } =
    api.video.getTrendingVideo.useQuery(v === "old" ? "old" : "now");

  useEffect(() => {
    if (v) {
      void refetch();
    }
  }, [v]);

  const tabs = [
    {
      name: "Now",
      path: `/feed/trending?v=now`,
      current: pathname === `/feed/trending?v=now`,
    },
    {
      name: "Old",
      path: `/feed/trending?v=old`,
      current: pathname === `/feed/trending?v=old`,
    },
  ];

  const Error = () => {
    if (isLoading) {
      return <LoadingMessage count={6} medium />;
    } else if (error ?? !data) {
      return (
        <ErrorMessage
          icon="Play"
          message="No Videos Trends"
          description="Sorry there is no videos trends at this time"
        />
      );
    } else {
      return <></>;
    }
  };

  return (
    <>
      <h1 className="flex gap-4 text-4xl font-bold leading-6">
        <TrendingUp className="h-8 w-8 stroke-primary" />
        Trending
      </h1>
      <div className="my-4 overflow-x-auto border-b border-gray-200 dark:border-secondary">
        <nav
          className="mb-px flex min-w-max whitespace-nowrap"
          aria-label="tabs"
        >
          {tabs.map((nav) => (
            <Link
              key={nav.name}
              href={nav.path}
              className={cn(
                `w-full border-b-4 px-1 py-4 text-center text-sm font-semibold`,
                {
                  "border-primary text-primary": nav.current,
                  "border-transparent text-primary/60 hover:border-gray-300 hover:text-primary":
                    !nav.current,
                },
              )}
              aria-label=""
            >
              {nav.name}
            </Link>
          ))}
        </nav>
      </div>

      {!data ?? error ? (
        <Error />
      ) : (
        <MultiColumnVideo
          videos={
            data?.videos.map((video) => ({
              id: video?.id ?? "",
              title: video?.title ?? "",
              thumbnailUrl: video?.thumbnailUrl ?? "",
              createdAt: video?.createdAt ?? new Date(),
              views: video?.views ?? 0,
            })) ?? []
          }
          users={
            data?.users.map((user) => ({
              name: user?.name ?? "",
              image: user?.image ?? "",
            })) ?? []
          }
        />
      )}
    </>
  );
}
