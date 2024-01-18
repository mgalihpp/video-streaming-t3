import { signIn, useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { ClockRewind, Folder, Home, UserCheck } from "./Icons/Icons";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface NavigationItem {
  name: string;
  path?: string;
  icon: (className: string) => JSX.Element;
  current: boolean;
}

export default function Footer() {
  const pathname = usePathname();
  const router = useRouter();

  const { data: sessionData } = useSession();
  const userId = sessionData?.user.id;
  const tabs: NavigationItem[] = [
    {
      name: "Home",
      path: "/",
      icon: (className) => <Home className={className} />,
      current: pathname === "/",
    },
    {
      name: "History",
      path: userId ? `/playlist/history` : "sign-in",
      icon: (className) => <ClockRewind className={className} />,
      current: pathname === "/playlist/history",
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
    <footer className="fixed bottom-0 z-50 w-full border border-gray-200 bg-white shadow-sm">
      <nav className="isolate flex rounded-lg shadow" aria-label="Tabs">
        {tabs.map((tab) => (
          <Link
            key={tab.name}
            href="#"
            className={cn(
              "group relative min-w-0 flex-1 overflow-hidden px-4 py-4 text-center text-xs font-medium text-gray-600 hover:bg-gray-50 focus:z-10",
              {
                "text-primary": tab.current,
              },
            )}
            onClick={(e) => {
              e.preventDefault();
              if (tab.path === "sign-out") {
                void signIn();
              } else {
                void router.push(tab.path ?? "/");
              }
            }}
          >
            <div className="flex flex-col items-center">
              {tab.current
                ? tab.icon("h-4 w-4 shrink-0 stroke-primary")
                : tab.icon(
                    "h-4 w-4 shrink-0 stroke-gray-400 group-hover:stroke-primary/90",
                  )}
              <span>{tab.name}</span>
            </div>
          </Link>
        ))}
      </nav>
    </footer>
  );
}
