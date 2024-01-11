import { cn } from "@/lib/utils";
import {
  ClockRewind,
  Folder,
  Home,
  ThumbsUp,
  UserCheck,
  VideoRecorder,
} from "./Icons/Icons";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";

interface SidebarProps {
  isOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  closeSidebar?: boolean;
}

interface NavigationItem {
  name: string;
  path?: string;
  icon: (className: string) => JSX.Element;
  current: boolean;
}

export default function SideBar({
  isOpen,
  setSidebarOpen,
  closeSidebar,
}: SidebarProps) {
  const pathname = usePathname();
  const { data: sessionData } = useSession();
  const userId = sessionData?.user.id;

  const router = useRouter();

  const DesktopNavigation: NavigationItem[] = [
    {
      name: "Home",
      path: "/",
      icon: (className) => <Home className={className} />,
      current: pathname === "/",
    },
    {
      name: "Liked Videos",
      path: userId ? `/playlist/LikedVideos` : "sign-in",
      icon: (className) => <ThumbsUp className={className} />,
      current: pathname === "/playlist/LikedVideos",
    },
    {
      name: "History",
      path: userId ? `/playlist/History` : "sign-in",
      icon: (className) => <ClockRewind className={className} />,
      current: pathname === "/playlist/History",
    },
    {
      name: "Your Videos",
      path: userId ? `/${String(userId)}/ProfileVideos` : "sign-in",
      icon: (className) => <VideoRecorder className={className} />,
      current: pathname === `/${String(userId)}/ProfileVideos`,
    },
    {
      name: "Library",
      path: userId ? `/${String(userId)}/ProfilePlaylists` : "sign-in",
      icon: (className) => <Folder className={className} />,
      current: pathname === `/${String(userId)}/ProfilePlaylists`,
    },
    {
      name: "Following",
      path: userId ? `/${String(userId)}/ProfileFollowing` : "sign-in",
      icon: (className) => <UserCheck className={className} />,
      current: pathname === `/${String(userId)}/ProfileFollowing`,
    },
  ];

  return (
    <>
      <div
        className={cn(
          closeSidebar ? "lg:w-20 " : "lg:w-56",
          "bottom-0 top-16 hidden lg:fixed lg:z-40 lg:flex lg:flex-col",
        )}
      >
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border border-gray-200 bg-white px-6 pb-4">
          <nav className="flex flex-1 flex-col pt-8">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {DesktopNavigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.path!}
                        onClick={(e) => {
                          e.preventDefault();

                          if (item.path === "sign-in") {
                            void signIn();
                          } else {
                            void router.push(item.path!);
                          }
                        }}
                        className={cn(
                          "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-400 hover:bg-gray-50 hover:text-primary/90",
                          { "bg-gray-50 text-primary": item.current },
                        )}
                      >
                        {item.current
                          ? item.icon("h-5 w-5 shrink-0 stroke-primary")
                          : item.icon(
                              "h-5 w-5 shrink-0 stroke-gray-400 group-hover:stroke-primary/90",
                            )}
                        <p className={cn("", { hidden: closeSidebar })}>
                          {item.name}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              <li className="mt-auto"></li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}
