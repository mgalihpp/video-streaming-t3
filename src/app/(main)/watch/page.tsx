import { type Metadata } from "next";
import Video from "./_components/Video";
import { api } from "@/trpc/server";

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const videoId = props.searchParams.video;

  const videoData = await api.video.getVideobyId({
    id: videoId as string,
  });

  if (!videoId || !videoData) {
    return {
      title: "Video not Found",
      description: "Sorry there is an error to loading video page",
    };
  }

  return {
    title: videoData.video.title,
    description: videoData.video.description,
    openGraph: {
      title: videoData.video.title,
      type: "video.other",
      url: `http://localhost:3000/watch?video=${videoData.video.id}`,
      images: [
        {
          url: videoData.video.thumbnailUrl ?? "",
          width: 800,
          height: 600,
          alt: `Video Thumbnail of ${videoData.video.title}`,
        },
      ],
    },
  };
}

export default async function WatchPage() {
  // SEO
  return <Video />;
}
