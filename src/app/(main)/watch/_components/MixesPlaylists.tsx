import { motion } from "framer-motion";
import { X, MoreVertical, Play } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface MixesPlaylistsProps {
  currentVideoIndex: number;
  playlistVideos: {
    id: string;
    title: string;
    thumbnailUrl: string;
    createdAt: Date;
    views: number;
    user: {
      name: string;
    };
  }[];
  playlist: {
    id: string;
    title: string;
    description: string;
    videoCount: number;
    playlistThumbnail: string;
    createdAt: Date;
  };
}

export function MixesPlaylists({
  currentVideoIndex,
  playlistVideos,
  playlist,
}: MixesPlaylistsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <Card className="mb-2 h-auto">
        <CardContent className="p-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="line-clamp-2">{playlist.title}</CardTitle>
                <CardDescription>{playlist.description}</CardDescription>
                <span className="text-xs">
                  {currentVideoIndex} / {playlist.videoCount} Videos
                </span>
              </div>
              <Button variant="ghost" size="icon" disabled>
                <X className="h-6 w-6" />
              </Button>
            </div>
          </CardHeader>
          <Separator />
          <ScrollArea className="h-96">
            <div className="space-y-2 p-4">
              {playlistVideos.map((video, index) => (
                <Link
                  href={`/watch?video=${video.id}&playlist=${playlist.id}&start=${index + 1}`}
                  key={index}
                  className={cn(
                    "group flex items-center space-x-4 rounded-md px-1 py-0.5 hover:bg-muted-foreground/20",
                    {
                      "bg-muted-foreground/20": currentVideoIndex === index + 1,
                    },
                  )}
                >
                  <div className="relative h-12 w-16 flex-shrink-0">
                    <Image
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="aspect-video rounded-md object-cover"
                      fill
                    />
                    <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black bg-opacity-50 text-white opacity-0 transition-opacity group-hover:opacity-100">
                      <Play className="size-5" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-grow">
                    <h3 className="line-clamp-2 text-sm font-medium">
                      {video.title}
                    </h3>
                    <p className="text-xs text-zinc-400">{video.user.name}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled
                      className="cursor-not-allowed"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </Link>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function MixesPlaylistsLoading() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardContent className="p-0">
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="mt-2 h-4 w-1/2" />
          </CardHeader>
          <Separator />
          <ScrollArea className="h-96">
            <div className="space-y-2 p-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <Skeleton className="h-[60px] w-[60px] rounded" />
                  <div className="flex-grow space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-3 w-8" />
                    <Skeleton className="h-6 w-6 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
}
