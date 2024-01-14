import React from "react";
import { GreenHorn, GreenPeople, GreenPlay } from "./Icons/Icons";
import { Skeleton } from "./ui/skeleton";
import { cn } from "@/lib/utils";

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
}: {
  count?: number;
  small?: boolean;
  medium?: boolean;
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
          <div className="max-w-xl h-[300px] flex flex-col" key={index}>
            <Skeleton className="max-w-xl h-3/5 md:h-3/5 lg:h-2/5 max-lg:h-2/5 xl:h-3/5 rounded-2xl" />
            <div className="max-w-xl h-[92px] max-h-[92px] mt-4 flex flex-row space-x-2">
              <Skeleton className="min-w-9 min-h-9 max-w-9 max-h-9 rounded-full" />
              <div className="flex flex-col w-full h-full space-y-2">
                <Skeleton className="w-full h-2/5"/>
                <Skeleton className="w-full h-1/5"/>
                <Skeleton className="w-full h-1/5"/>
              </div>
            </div>
          </div>
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
          </div>
        ),
      )}
    </div>
  );
}
