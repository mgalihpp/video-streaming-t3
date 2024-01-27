import { signIn, useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { Folder, Home, UserCheck } from "./Icons/Icons";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { TrendingUp } from "lucide-react";

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
      name: "Library",
      path: userId
        ? `/channel/${String(userId)}/playlists`
        : "/api/auth/signin",
      icon: (className) => <Folder className={className} />,
      current: pathname === `/channel/${String(userId)}/playlists`,
    },
    {
      name: "Following",
      path: userId
        ? `/channel/${String(userId)}/followings`
        : "/api/auth/signin",
      icon: (className) => <UserCheck className={className} />,
      current: pathname === `/channel/${String(userId)}/followings`,
    },
    {
      name: "Trending",
      path: userId ? `/feed/trending` : "/api/auth/signin",
      icon: (className) => <TrendingUp className={className} />,
      current: pathname === `/feed/trending`,
    },
  ];

  return (
    <footer className="fixed bottom-0 z-50 w-full border border-gray-200 bg-background shadow-sm dark:border-secondary">
      <nav className="isolate flex rounded-lg shadow" aria-label="Tabs">
        {tabs.map((tab) => (
          <Link
            key={tab.name}
            href="#"
            className={cn(
              "group relative min-w-0 flex-1 overflow-hidden px-4 py-4 text-center text-xs font-medium text-primary/80 hover:bg-secondary focus:z-10",
              {
                "text-primary": tab.current,
              },
            )}
            onClick={(e) => {
              e.preventDefault();
              if (tab.path === "/api/auth/signin") {
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
