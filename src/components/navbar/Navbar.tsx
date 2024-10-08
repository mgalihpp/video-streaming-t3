"use client";

import Link from "next/link";
import React, { type ChangeEvent, type KeyboardEvent, useState } from "react";
import { DotsVertical, Logo, Search } from "@/components/Icons/Icons";
import { useRouter } from "next/navigation";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { signIn, signOut, useSession } from "next-auth/react";
import { UserImage } from "@/components/video/VideoUserImage";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { signedInNavigation, signOutNavigation } from "@/constants/navLinks";

interface NavbarProps {
  children?: JSX.Element;
}

export default function Navbar({ children }: NavbarProps) {
  const { data: sessionData } = useSession();
  const router = useRouter();

  const Navigation = sessionData
    ? signedInNavigation(sessionData.user.id)
    : signOutNavigation;

  const [searchInput, setSearchInput] = useState("");

  const handleSearch = async () => {
    router.push(`/search?q=${searchInput}`);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      void handleSearch();
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-gray-300 bg-background shadow-sm dark:border-secondary">
        <div className="mx-auto flex max-w-full flex-row justify-between px-6 lg:px-16">
          <div className="mr-5 flex flex-shrink-0 items-center max-xs:hidden lg:static xl:col-span-2">
            <Link href="/#" aria-label="Home">
              <Logo width={50} height={50} />
            </Link>
          </div>
          <div className="flex w-full min-w-0 justify-center lg:px-0 xl:col-span-8">
            <div className="flex w-full items-center px-6 py-4 sm:w-1/2 lg:mx-0 lg:max-w-none xl:mx-0 xl:px-0">
              <div className="w-full">
                <label htmlFor="search" className="sr-only">
                  Search
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-5 w-5 stroke-primary" />
                  </div>
                  <input
                    id="search"
                    name="search"
                    className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-primary/90 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary dark:bg-secondary sm:text-sm sm:leading-6"
                    placeholder="Search"
                    type="search"
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setSearchInput(e.target.value)
                    }
                    onKeyDown={handleKeyDown}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center lg:hidden">
            {/* Mobile Menu */}
            {children}
          </div>
          <div className="m-0 hidden w-max px-0 lg:flex lg:items-center lg:justify-end xl:col-span-2">
            {/* 3 dots  and Profile dropdown */}
            <Menu as="div" className="relative ml-5 flex-shrink-0">
              <div>
                <MenuButton className="focus:ring-primary-500 flex rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2">
                  {sessionData ? (
                    <UserImage image={sessionData?.user.image ?? ""} />
                  ) : (
                    <DotsVertical className="w-5 stroke-gray-700" />
                  )}
                </MenuButton>
              </div>
              {/* <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              > */}
              <MenuItems
                transition
                className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-background py-1 shadow-lg ring-1 ring-secondary ring-opacity-5 focus:outline-none"
              >
                {sessionData ? (
                  <div className="mx-4 my-2 flex">
                    {/* <div className="h-9 w-9"> */}
                    <UserImage image={sessionData?.user.image ?? ""} />
                    {/* </div> */}
                    <div className="ml-2 flex w-full flex-col justify-start truncate">
                      <p className="truncate text-sm font-semibold text-primary">
                        {sessionData && <span>{sessionData.user?.name}</span>}
                      </p>
                      <p className="truncate text-sm text-primary/70">
                        {sessionData && (
                          <span className="">{sessionData.user?.email}</span>
                        )}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="mx-4 my-2 flex text-center text-sm font-semibold text-primary">
                    Menu
                  </p>
                )}
                {Navigation.map((item) => (
                  <MenuItem key={item.name}>
                    {({ active }) => (
                      <Link
                        onClick={() => {
                          if (item.path === "/api/auth/signout") {
                            void signOut();
                          } else {
                            void router.push(item.path ?? "/");
                          }
                        }}
                        href={item.path ?? "/"}
                        className={cn(
                          active ? "bg-secondary" : "",
                          "block px-4 py-2 text-sm text-primary",
                          item.lineAbove
                            ? "border-t border-gray-300 dark:border-secondary/80"
                            : "",
                        )}
                      >
                        <div className="flex items-center">
                          {item.icon("h-4 w-4 stroke-primary")}
                          <div className="pl-2">{item.name}</div>
                        </div>
                      </Link>
                    )}
                  </MenuItem>
                ))}
              </MenuItems>
              {/* </Transition> */}
            </Menu>
            {/*Sign up login buttons*/}
            {!sessionData && (
              <div className="flex flex-row space-x-3">
                <Button
                  className="ml-4"
                  size="sm"
                  onClick={!sessionData ? () => router.push('/login') : void {}}
                >
                  Log in
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
