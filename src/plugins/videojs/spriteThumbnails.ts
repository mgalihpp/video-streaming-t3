import { type SpriteThumbnailsOptions, type CustomPlayer } from "@/types/video";
import "videojs-sprite-thumbnails";

function initSpriteThumbnails(
  player: CustomPlayer,
  options: SpriteThumbnailsOptions,
) {
  // Initialize the sprite thumbnails plugin with options
  if (player.spriteThumbnails) {
    player.spriteThumbnails(options).log.level("debug");
  }
}

export default initSpriteThumbnails;
