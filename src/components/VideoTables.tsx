"use client";

import { Thumbnail, PublishButton, DeleteButton, EditButton } from ".";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "./ui/pagination";
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from "./ui/table";
import { Separator } from "./ui/separator";
import { api } from "@/trpc/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Skeleton } from "./ui/skeleton";
import { User } from "./Icons/Icons";
import { MessageCircleMore } from "lucide-react";
import { Button } from "./ui/button";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

export default function VideoTables() {
  const [page, setPage] = useState(0);
  const isRefetch = useSelector((state: RootState) => state.refetch.isRefetch);

  const {
    data,
    isLoading,
    fetchNextPage,
    fetchPreviousPage,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
  } = api.user.getInfiniteVideo.useInfiniteQuery(
    {
      limit: 5,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchOnWindowFocus: false,
    },
  );

  useEffect(() => {
    if (isRefetch) {
      void refetch();
    }
  }, [isRefetch]);

  const hasPreviousPage = page > 0;
  const videos = data?.pages[page]?.videos;

  const handleFetchNextPage = () => {
    void fetchNextPage();
    setPage((prev) => prev + 1);
  };

  const handleFetchPrevPage = () => {
    if (hasPreviousPage) {
      void fetchPreviousPage();
      setPage((prev) => prev - 1);
    }
  };

  return (
    <>
      <Table className="rounded-lg shadow">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px] text-center">Video</TableHead>
            <TableHead className="w-[100px] text-center">Status</TableHead>
            <TableHead className="text-center">Date</TableHead>
            <TableHead className="text-center">Views</TableHead>
            <TableHead className="text-center">Comments</TableHead>
            <TableHead className="text-center">Likes/Dislikes</TableHead>
            <TableHead className="text-center">Options</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading || isFetchingNextPage || isFetchingPreviousPage
            ? Array.from({ length: 5 }, (_, index) => (
                <TableRow key={index}>
                  <TableCell className="h-[200px] w-[250px]">
                    <Skeleton className="h-full w-full" />
                  </TableCell>
                  <TableCell className="p-10">
                    <Skeleton className="h-8 w-20 rounded-full" />
                  </TableCell>
                  <TableCell className="p-10">
                    <Skeleton className="mx-auto h-8 w-20 rounded-full" />
                  </TableCell>
                  <TableCell className="p-10">
                    <Skeleton className="mx-auto h-8 w-20 rounded-full" />
                  </TableCell>
                  <TableCell className="p-10">
                    <Skeleton className="mx-auto h-8 w-20 rounded-full" />
                  </TableCell>
                  <TableCell className="p-10">
                    <Skeleton className="mx-auto h-8 w-20 rounded-full" />
                  </TableCell>
                  <TableCell className="p-10">
                    <Skeleton className="mx-auto h-8 w-20 rounded-full" />
                  </TableCell>
                </TableRow>
              ))
            : videos?.map((video) => (
                <TableRow key={video.id}>
                  <TableCell className="flex h-[200px] w-[250px] flex-col items-center gap-4">
                    <Link
                      href={`/watch?video=${video.id}`}
                      className="h-1/2 w-full  "
                    >
                      <Thumbnail
                        thumbnailUrl={
                          video.thumbnailUrl !== ""
                            ? video.thumbnailUrl
                            : "/background.jpg"
                        }
                      />
                    </Link>
                    <div className="flex h-full w-full flex-col justify-center truncate">
                      <p className="text-base text-primary">{video.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {video.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <PublishButton video={video} />
                  </TableCell>
                  <TableCell className="text-center">
                    <p className="whitespace-nowrap px-3 py-5 text-sm text-primary/80">
                      {video.createdAt.toLocaleDateString()}
                    </p>
                  </TableCell>
                  <TableCell className="text-center">
                    <p className="flex justify-center gap-2 whitespace-nowrap px-3 py-5 text-sm text-primary/80">
                      {video.views}{" "}
                      <User className="h-5 w-5 stroke-primary/80" />
                    </p>
                  </TableCell>
                  <TableCell className="text-center">
                    <p className="flex justify-center gap-2 whitespace-nowrap px-3 py-5 text-sm text-primary/80">
                      {video.comments}{" "}
                      <MessageCircleMore className="h-5 w-5 stroke-primary/80" />
                    </p>
                  </TableCell>
                  <TableCell className="flex flex-col text-center">
                    <p className="text-center text-green-700">
                      {video.likes} Likes
                    </p>
                    <p className="text-center text-red-700">
                      {video.dislikes} Dislikes
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-row items-center justify-center">
                      <DeleteButton videoId={video.id} refetch={refetch} />
                      <EditButton video={video} refetch={refetch} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>
      <div className="w-full shadow">
        <Separator />
        <Pagination className="flex w-full items-center justify-center">
          <PaginationContent className="py-2">
            <PaginationItem>
              <Button
                variant="outline"
                onClick={handleFetchPrevPage}
                disabled={!hasPreviousPage}
              >
                Previous
              </Button>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink>{page}</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <Button
                variant="outline"
                onClick={handleFetchNextPage}
                disabled={
                  !hasNextPage && page === (data?.pages?.length ?? 0) - 1
                }
              >
                Next
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
        <Separator />
      </div>
    </>
  );
}
