"use client";

import { ErrorMessage, FollowButton, UserImage } from "..";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import Image from "next/image";
import { buttonVariants } from "../ui/button";
import Link from "next/link";
import { Edit } from "../Icons/Icons";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface ProfileHeaderProps {
  channelId: string;
  userId: string;
  user: {
    followers: number;
    followings: number;
    id: string;
    name: string | null;
    email: string | null;
    emailVerified: Date | null;
    image: string | null;
    backgroundImage: string | null;
    handle: string | null;
    description: string | null;
  };
  viewer: {
    hasFollowed: boolean;
  };
}

export default function ProfileHeader({
  channelId,
  userId,
  user,
  viewer,
}: ProfileHeaderProps) {
  const pathname = usePathname();
  const errorTypes = !user ?? !viewer;

  const tabs = [
    {
      name: "Videos",
      path: `/channel/${String(userId)}`,
      current: pathname === `/channel/${String(userId)}`,
    },
    {
      name: "Playlists",
      path: `/channel/${String(userId)}/playlists`,
      current: pathname === `/channel/${String(userId)}/playlists`,
    },
    {
      name: "Announcements",
      path: `/channel/${String(userId)}/post`,
      current: pathname === `/channel/${String(userId)}/post`,
    },
    {
      name: "Following",
      path: `/channel/${String(userId)}/following`,
      current: pathname === `/channel/${String(userId)}/following`,
    },
  ];

  useEffect(() => {
    tabs.forEach((nav) => {
      nav.current = nav.path === pathname;
    });
  }, [pathname]);

  const Error = () => {
    if (errorTypes) {
      return (
        <ErrorMessage
          icon="People"
          message="Channel not_found"
          className="items-center"
          description="Sorry there is an error to loading channel page"
        />
      );
    } else {
      return <></>;
    }
  };

  useDocumentTitle({
    title: `${user?.name ?? "Video App"}`,
    description: `${user?.description ?? ""}`,
  });

  return (
    <>
      {errorTypes ? (
        <Error />
      ) : (
        <>
          <Image
            className="h-32 w-full object-cover lg:h-64"
            src={user?.backgroundImage ?? "/background.jpg"}
            alt="user channel bg image"
            width={1000}
            height={128}
          />
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <div className="!-mt-6 sm:mt-16 sm:flex sm:items-end sm:space-x-4">
              <div className="flex">
                <UserImage
                  image={user?.image ?? ""}
                  className="min-h-24 min-w-24 max-h-24 max-w-24 sm:min-h-32 sm:min-w-32 sm:max-h-32 sm:max-w-32"
                />
              </div>
              <div className="mt-6 sm:flex sm:min-w-0 sm:flex-1 sm:items-center sm:justify-end sm:space-x-6 sm:pb-1">
                <div className="mt-6 min-w-0 flex-1 md:block">
                  <h1 className="truncate text-2xl font-bold text-gray-900">
                    {user?.name ?? ""}
                  </h1>
                  <p className="text-regular text-gray-600">{user?.handle}</p>
                  <div className="mb-1 flex items-center justify-start text-xs">
                    <p className="text-gray-600">{user?.followers} Followers</p>
                    <li className="pl-2 text-sm text-gray-500"></li>
                    <p className="text-gray-500">
                      {user?.followings} Following
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex justify-stretch space-y-3 sm:space-x-4 sm:space-y-0">
                  {channelId === userId ? (
                    <Link
                      href="/settings"
                      className={buttonVariants({
                        className: "ml-2 flex",
                      })}
                    >
                      <Edit className="w-5 h-5 mr-2 shrink-0 stroke-white" />
                      Edit
                    </Link>
                  ) : (
                    <FollowButton
                      followingId={userId}
                      viewer={{ hasFollowed: viewer?.hasFollowed ?? false }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8 mt-4 overflow-x-auto border-b border-gray-200">
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
                      "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700":
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
        </>
      )}
    </>
  );
}
