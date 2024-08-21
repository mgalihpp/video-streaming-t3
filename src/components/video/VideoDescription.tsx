"use client";

import { useState } from "react";

export function VideoDescription({
  text,
  length,
  border = false,
}: {
  text: string;
  length: number;
  border?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  if (text.length === 0 || text === null) {
    return null;
  } else if (text.length < length) {
    return (
      <>
        {border ? (
          <div className="border-b border-gray-200 dark:border-secondary"></div>
        ) : null}
        <p className="my-3 text-left text-sm font-semibold text-primary/80">
          {text}
        </p>
      </>
    );
  } else {
    return (
      <>
        {border ? (
          <div className="border-b border-gray-200 dark:border-secondary"></div>
        ) : null}
        <div className="relative w-full">
          {!isExpanded ? (
            <button
              onClick={toggleExpand}
              className="flex w-full flex-row place-content-evenly"
            >
              <p
                className={`w-full whitespace-pre-wrap break-words text-left text-sm font-semibold text-primary/80 ${
                  !isExpanded ? "line-clamp-2" : ""
                }`}
              >
                {text}
              </p>
            </button>
          ) : (
            <div className="space-y-4">
              <p
                className={`w-full whitespace-pre-wrap break-words text-left text-sm font-semibold text-primary/80 ${
                  !isExpanded ? "line-clamp-2" : ""
                }`}
              >
                {text}
              </p>

              <button
                onClick={toggleExpand}
                aria-label="Show less"
                name="less"
                className="font-semibold"
              >
                Show less
              </button>
            </div>
          )}
        </div>
      </>
    );
  }
}
