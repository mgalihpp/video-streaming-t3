import type Player from "video.js/dist/types/player";

export interface SpriteThumbnailsOptions {
  url?: string; // Location of a single sprite image
  urlArray?: string[]; // Locations of multiple images
  width?: number; // Width of a thumbnail in pixels (required)
  height?: number; // Height of a thumbnail in pixels (required)
  columns?: number; // Number of thumbnail columns per image (required)
  rows?: number; // Number of thumbnail rows per image (optional)
  interval?: number; // Interval between thumbnails in seconds (default is 1)
  idxTag?: (index: number) => number; // Function determining how the {index} template in the URL is expanded
  responsive?: number; // Width of player in pixels below which thumbnails are responsive (default is 600)
  downlink?: number; // Minimum required NetworkInformation downlink (default is 1.5, set to 0 to disable)
}

export interface SpriteThumbnailsReturnType {
  log: {
    level: (level: string) => void;
  };
}

export type CustomPlayer = Player & {
  controlBar?: {
    addClass(className: string): void;
  };
  httpSourceSelector?: () => void;
  spriteThumbnails?: (
    opts: SpriteThumbnailsOptions,
  ) => SpriteThumbnailsReturnType;
};
