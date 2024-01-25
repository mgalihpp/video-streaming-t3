import React from "react";
import { GreenHorn, GreenPeople, GreenPlay } from "./Icons/Icons";
import { Skeleton } from "./ui/skeleton";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type IconSelectionProps = {
  icon: "Horn" | "People" | "Play";
  className: string;
};

type ErrorMessageProps = {
  children?: React.ReactNode;
  icon: "Horn" | "People" | "Play";
  message: string;
  description: string;
  className?: string;
};

export function ErrorMessage({
  children,
  message,
  description,
  icon,
  className,
}: ErrorMessageProps) {
  const IconSelection = ({ icon, className }: IconSelectionProps) => {
    if (icon === "Horn") {
      return <GreenHorn className={className} />;
    } else if (icon === "People") {
      return <GreenPeople className={className} />;
    } else {
      return <GreenPlay className={className} />;
    }
  };

  return (
    <div
      className={`relative mt-16 flex w-full flex-col ${
        className ? className : "items-center justify-center"
      } gap-2 text-center`}
    >
      <IconSelection className="center items-center" icon={icon ?? "Play"} />
      <h1 className="text-2xl font-semibold text-primary">{message}</h1>
      <p className="max-w-xs text-gray-600">{description}</p>
      {children}
    </div>
  );
}

export function LoadingMessage({
  count = 1,
  small = false,
  medium = false,
  profile = false,
}: {
  count?: number;
  small?: boolean;
  medium?: boolean;
  profile?: boolean;
}) {
  return (
    <div
      className={cn("", {
        "relative isolate my-4 flex flex-col gap-4 rounded-2xl": small,
        "relative flex w-full flex-col gap-2 text-center py-4 sm:px-4 lg:w-4/5":
          !small && !medium,
        "mx-auto grid grid-cols-1 gap-x-4 gap-y-8 md:mx-0 md:max-w-none md:grid-cols-2 lg:mx-0 lg:grid-cols-3 xl:mx-0 xl:max-w-none 2xl:mx-0 2xl:max-w-none 2xl:grid-cols-3":
          medium,
      })}
    >
      {Array.from({ length: count }, (_, index) =>
        small ? (
          <div key={index} className="w-full grid grid-cols-2 gap-1">
            <Skeleton key={index} className={"aspect-[16/9] sm:aspect-[2/1]"} />
            <div className="p-1 flex flex-col space-y-2">
              <Skeleton className="w-full h-12" />
              <Skeleton className="w-full h-5" />
              <Skeleton className="w-full h-5" />
            </div>
          </div>
        ) : medium ? (
          <div className="max-w-xl h-fit flex flex-col" key={index}>
            <Skeleton className="max-w-xl h-[calc(8vw+80px)] max-h-[200px] rounded-2xl" />
            <div className="max-w-xl h-[92px] max-h-[92px] mt-4 flex flex-row space-x-2">
              <Skeleton className="min-w-9 min-h-9 max-w-9 max-h-9 rounded-full" />
              <div className="flex flex-col w-full h-full space-y-2">
                <Skeleton className="w-full h-2/5" />
                <Skeleton className="w-full h-1/5" />
                <Skeleton className="w-full h-1/5" />
              </div>
            </div>
          </div>
        ) : profile ? (
          <>
          <div className="mx-auto flex items-center justify-center h-screen">
            <Loader2 className="w-12 h-12 animate-spin"/>
          </div>

          </>
        ) : (
          <div key={index}>
            <Skeleton className="w-full h-[200px] sm:h-[300px] lg:h-[499px] " />
            <div className="mt-4 p-4 flex flex-col border space-y-2">
              <div className="flex flex-col gap-2">
                <Skeleton className="w-full h-6" />

                <Skeleton className="w-full h-5" />
              </div>
              <div className="flex flex-row space-x-2">
                <Skeleton className="min-w-9 min-h-9 max-w-9 max-h-9 rounded-full" />
                <div className="flex flex-col gap-2 h-10 w-16">
                  <Skeleton className="w-full h-5" />
                  <Skeleton className="w-full h-5" />
                </div>
              </div>
            </div>
            <div className="my-5 flex space-x-3 rounded-2xl border border-gray-200 dark:border-secondary p-6 shadow-sm">
              <div className="min-w-0 flex-1 space-y-3">
                <Skeleton className="w-1/6 h-5" />
                <div className="mt-2 flex flex-row gap-2 w-full">
                  <Skeleton className="w-11/12 h-10" />
                  <Skeleton className="w-1/12 h-10" />
                </div>

                <div className="my-6">
                  {Array.from({ length: 6 }, (_, index) => (
                    <div key={index}>
                      <div className="my-4 border-t border-gray-200 dark:border-secondary" />
                      <div className="flex gap-2">
                        <Skeleton className="w-9 h-9 rounded-full" />
                        <div className="flex w-full flex-col gap-2">
                          <div className="flex flex-col gap-2">
                            <div className="flex flex-row">
                              <Skeleton className="w-full h-6" />
                            </div>
                            <Skeleton className="w-full h-6" />
                          </div>
                          <Skeleton className="w-full h-5" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ),
      )}
    </div>
  );
}
