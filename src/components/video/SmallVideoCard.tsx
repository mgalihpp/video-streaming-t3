import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { VideoTitle } from "./VIdeoTitle";
import { VideoUserName } from "./VideoUsername";
import { VideoInfo } from "./VideoInfo";
import { Thumbnail } from "./Thumbnail";
import Link from "next/link";

interface VideoCardProps {
  videoId: string;
  thumbnailUrl: string;
  title: string;
  userImage: string;
  userName: string;
  views: number;
  createdAt: Date;
}

export default function SmallVideoCard({
  videoId,
  thumbnailUrl,
  title,
  userImage,
  userName,
  views,
  createdAt,
}: VideoCardProps) {
  return (
    <Link
      href={`/watch?video=${videoId}`}
      className="group rounded-xl bg-background p-2 transition-all duration-300 ease-in-out hover:bg-muted-foreground/20"
    >
      <Card className="w-full gap-2 border-none bg-transparent shadow-none lg:flex lg:flex-row">
        <div className="relative flex-shrink-0 lg:w-1/2">
          <Thumbnail thumbnailUrl={thumbnailUrl} title={title} />
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            <PlayIcon className="h-12 w-12 text-white" />
          </div>
        </div>
        <CardContent className="flex-grow space-y-2 p-4 lg:p-0">
          <div className="flex w-full gap-2">
            <div className="lg:hidden">
              <Avatar
                onClick={(e) => {
                  console.log("Avatar clicked");
                  e.preventDefault();
                }}
              >
                <AvatarImage src={userImage} alt={userName} />
                <AvatarFallback>{userName}</AvatarFallback>
              </Avatar>
            </div>
            <div>
              <VideoTitle
                title={title}
                limitHeight
                limitSize
                className="tracking-tighter"
              />
              <div className="flex items-center gap-3">
                <div>
                  <VideoUserName name={userName} />
                  <VideoInfo views={views} createdAt={createdAt} />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function PlayIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="6 3 20 12 6 21 6 3" />
    </svg>
  );
}
