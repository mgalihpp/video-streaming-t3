"use client";

import { cn } from "@/lib/utils";
import {
  Brush,
  ClockRewind,
  Close,
  File,
  Folder,
  HelpCircle,
  Home,
  Lock,
  LogOut,
  Logo,
  MessagePlusSquare,
  Settings,
  ThumbsUp,
  User,
  UserCheck,
  VideoRecorder,
} from "./Icons/Icons";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { Fragment, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Button } from "./ui/button";
import { UserImage } from ".";

interface SidebarProps {
  isOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  closeSidebar?: boolean;
  setCloseSideBar: (open: boolean) => void;
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
  setCloseSideBar,
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
      path: userId ? `/playlist/likedvideos` : "sign-in",
      icon: (className) => <ThumbsUp className={className} />,
      current: pathname === "/playlist/likedvideos",
    },
    {
      name: "History",
      path: userId ? `/playlist/history` : "sign-in",
      icon: (className) => <ClockRewind className={className} />,
      current: pathname === "/playlist/history",
    },
    {
      name: "Your Videos",
      path: userId ? `/channel/${String(userId)}` : "sign-in",
      icon: (className) => <VideoRecorder className={className} />,
      current: pathname === `/channel/${String(userId)}`,
    },
    {
      name: "Library",
      path: userId ? `/channel/${String(userId)}/playlists` : "sign-in",
      icon: (className) => <Folder className={className} />,
      current: pathname === `/channel/${String(userId)}/playlists`,
    },
    {
      name: "Following",
      path: userId ? `/channel/${String(userId)}/followings` : "sign-in",
      icon: (className) => <UserCheck className={className} />,
      current: pathname === `/channel/${String(userId)}/followings`,
    },
  ];

  const signedInMobileNavigation: NavigationItem[] = [
    {
      name: "Profile",
      path: `/channel/${String(userId)}`,
      icon: (className) => <User className={className} />,
      current: pathname === `/channel/${String(userId)}`,
    },
    {
      icon: (className) => <Brush className={className} />,
      name: "Creator Studio",
      path: `/dashboard`,
      current: pathname === "/dashboard",
    },
    {
      icon: (className) => <HelpCircle className={className} />,
      name: "Help",
      path: `/blog/help`,
      current: pathname === `/blog/help`,
    },
    {
      icon: (className) => <Settings className={className} />,
      name: "Settings",
      path: `/settings`,
      current: pathname === `/settings`,
    },
    {
      icon: (className) => <MessagePlusSquare className={className} />,
      name: "Feedback",
      path: `mailto:muhammadgalih451@gmail.com`,
      current: pathname === "/feedback",
    },
  ];

  const signOutMobileNavigation: NavigationItem[] = [
    {
      name: "Help",
      path: "/blog/help",
      icon: (className) => <HelpCircle className={className} />,
      current: pathname === "/blog/help",
    },
    {
      icon: (className) => <MessagePlusSquare className={className} />,
      name: "Feedback",
      path: `mailto:muhammadgalih451@gmail.com`,
      current: pathname === "/feedback",
    },
  ];

  const mobileNavigation = sessionData
    ? signedInMobileNavigation
    : signOutMobileNavigation;

  useEffect(() => {
    DesktopNavigation.forEach((nav) => {
      nav.current = nav.path === pathname;
    });
    mobileNavigation.forEach((nav) => {
      nav.current = nav.path === pathname;
    });
  }, [pathname]);

  return (
    <>
      <div
        onMouseEnter={() => setCloseSideBar(false)}
        onMouseLeave={() => setCloseSideBar(true)}
        className={cn(
          closeSidebar ? "lg:w-20 " : "lg:w-56",
          "bottom-0 top-16 hidden lg:fixed lg:z-40 lg:flex lg:flex-col transition-all ease-in-out duration-800",
        )}
      >
        <div className="flex grow flex-col gap-y-5 overflow-y-auto overflow-x-hidden border border-gray-300 dark:border-secondary bg-background px-6 pb-4">
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
                          "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-primary/40 hover:bg-secondary hover:text-primary",
                          { "bg-secondary text-primary": item.current },
                        )}
                      >
                        {item.current
                          ? item.icon("h-5 w-5 shrink-0 stroke-primary")
                          : item.icon(
                              "h-5 w-5 shrink-0 stroke-primary/40 group-hover:stroke-primary",
                            )}
                        <p
                          className={cn("font-semibold truncate", {
                            hidden: closeSidebar,
                          })}
                        >
                          {item.name}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              <li className="mt-auto">
                <Link
                  href=""
                  onClick={(e) => {
                    e.preventDefault();
                    {
                      sessionData
                        ? void router.push("/settings")
                        : void signIn();
                    }
                  }}
                  className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-primary/40 hover:bg-secondary hover:text-primary"
                >
                  <Settings className="h-5 w-5 shrink-0 stroke-primary/40 group-hover:stroke-primary" />

                  <p className={cn("", { hidden: closeSidebar })}>Settings</p>
                </Link>
                <Link
                  href="/blog/help"
                  className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-primary/40 hover:bg-secondary hover:text-primary"
                >
                  <HelpCircle className="h-5 w-5 shrink-0 stroke-primary/40 group-hover:stroke-primary" />

                  <p className={cn("", { hidden: closeSidebar })}>Help</p>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      <Transition.Root as={Fragment} show={isOpen}>
        <Dialog
          as="div"
          className="relative z-50 lg:hidden"
          onClose={setSidebarOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>
          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition transform ease-linear duration-300"
              enterFrom="-translate-x-[200px]"
              enterTo="translate-x-0"
              leave="transition transform ease-linear duration-300"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-[200px]"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <div className="absolute left-full top-0 w-16 justify-center pt-5">
                  <Button
                    className="ml-2 rounded-full p-2"
                    variant="outline"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Close className="h-6 w-6 stroke-primary" aria-hidden="true" />
                  </Button>
                </div>

                <div className="flex grow flex-col gap-y-5 overflow-y-auto border-gray-300 dark:border-secondary bg-background px-6 pb-4">
                  <nav className="flex flex-1 flex-col pt-4 ">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                      <Logo width={50} height={50} />
                      <li className="border-t">
                        <ul role="list" className="-mx-2 space-y-1 pt-3">
                          {mobileNavigation.map((item) => (
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
                                  "group flex gap-x-3 rounded-md p-2 px-2 py-1.5 text-sm font-semibold leading-6 text-primary/40 hover:bg-secondary hover:text-primary",
                                  { "bg-secondary text-primary": item.current },
                                )}
                              >
                                {item.current
                                  ? item.icon("h-5 w-5 shrink-0 stroke-primary")
                                  : item.icon(
                                      "h-5 w-5 shrink-0 stroke-primary/40 group-hover:stroke-primary",
                                    )}
                                <p
                                  className={cn("font-semibold", {
                                    hidden: closeSidebar,
                                  })}
                                >
                                  {item.name}
                                </p>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </li>
                    </ul>
                    <li className="mt-auto list-none border-b">
                      <Link
                        href="/blog/privacy"
                        className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-primary/40 hover:bg-secondary hover:text-primary"
                      >
                        <Lock className="h-5 w-5 shrink-0 stroke-primary/40 group-hover:stroke-primary" />
                        Privacy
                      </Link>
                      <Link
                        href="/blog/tems"
                        className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-primary/40 hover:bg-secondary hover:text-primary"
                      >
                        <File className="h-5 w-5 shrink-0 stroke-primary/40 group-hover:stroke-primary" />
                        Terms of Service
                      </Link>
                    </li>
                    {sessionData ? (
                      <div className="my-2 flex flex-row">
                        <UserImage
                          image={sessionData.user.image ?? "/profile.jpg"}
                        />
                        <div className="ml-2 flex w-full flex-col justify-center truncate text-sm">
                          <p className="font-semibold text-primary">
                            {sessionData && (
                              <span>{sessionData.user.name}</span>
                            )}
                          </p>
                          <p className="text-primary/70">
                            {sessionData && (
                              <span>{sessionData.user.email}</span>
                            )}
                          </p>
                        </div>
                        <Button
                          className="ml-2"
                          variant="outline"
                          onClick={(e) => {
                            e.preventDefault();
                            void signOut();
                          }}
                        >
                          <LogOut className="h-5 w-5 stroke-primary" />
                        </Button>
                      </div>
                    ) : (
                      <div className="mt-4 list-none space-y-2">
                        <Button
                          className="w-full"
                          onClick={(e) => {
                            e.preventDefault();
                            void signIn();
                          }}
                        >
                          Log in
                        </Button>
                      </div>
                    )}
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
      {/* Static  sidebar*/}
    </>
  );
}
