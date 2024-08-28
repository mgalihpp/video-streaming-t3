interface VideoData {
  video: {
    comments: {
      likes: number;
      dislikes: number;
      replies: {
        user: {
          id: string;
          name: string | null;
          email: string | null;
          emailVerified: Date | null;
          image: string | null;
          handle: string | null;
          description: string | null;
          backgroundImage: string | null;
        } | null;
        likes: number;
        dislikes: number;
        replies: {
          id: string;
          message: string | null;
          videoId: string;
          userId: string;
          parentId: string | null;
          createdAt: Date;
          updateAt: Date;
        }[];
        id: string;
        message: string | null;
        videoId: string;
        userId: string;
        parentId: string | null;
        createdAt: Date;
        updateAt: Date;
      }[];
      user: {
        id: string;
        name: string | null;
        email: string | null;
        emailVerified: Date | null;
        image: string | null;
        handle: string | null;
        description: string | null;
        backgroundImage: string | null;
      };
      id: string;
      message: string | null;
      videoId: string;
      userId: string;
      parentId: string | null;
      createdAt: Date;
      updateAt: Date;
    }[];
    followers: number;
    likes: number;
    dislikes: number;
    views: number;
    viewer: {
      hasFollowed: boolean;
      hasLiked: boolean;
      hasDisliked: boolean;
    };
    user?:
      | {
          id: string;
          name: string | null;
          email: string | null;
          emailVerified: Date | null;
          image: string | null;
          handle: string | null;
          description: string | null;
          backgroundImage: string | null;
        }
      | undefined;
    id?: string | undefined;
    title?: string | undefined;
    description?: string | undefined;
    thumbnailUrl?: string | undefined;
    spriteThumbnails?: string[] | undefined;
    videoUrl?: string | undefined;
    publish?: boolean | undefined;
    userId?: string | undefined;
    createdAt?: Date | undefined;
    updateAt?: Date | undefined;
  };
}

interface playlistData {
  user: {
    followers: number;
    id: string;
    name: string | null;
    email: string | null;
    emailVerified: Date | null;
    image: string | null;
    handle: string | null;
    description: string | null;
    backgroundImage: string | null;
  };
  PlaylistHasVideo: {
    views: number;
    user?:
      | {
          id: string;
          name: string | null;
          email: string | null;
          emailVerified: Date | null;
          image: string | null;
          handle: string | null;
          description: string | null;
          backgroundImage: string | null;
        }
      | undefined;
    id?: string | undefined;
    title?: string | undefined;
    description?: string | undefined;
    thumbnailUrl?: string | undefined;
    spriteThumbnails?: string[] | undefined;
    videoUrl?: string | undefined;
    publish?: boolean | undefined;
    userId?: string | undefined;
    createdAt?: Date | undefined;
    updateAt?: Date | undefined;
  }[];
  id: string;
  title: string;
  description: string | null;
  userId: string;
  createdAt: Date;
  updateAt: Date;
}

class VideoPlayerHelper {
  private playlistData?: playlistData;
  private startedPlaylistVideoIndex?: string;
  private videoData?: VideoData | null | undefined;

  constructor(
    playlistData?: playlistData,
    startedPlaylistVideoIndex?: string,
    videoData?: VideoData | null | undefined,
  ) {
    this.playlistData = playlistData;
    this.startedPlaylistVideoIndex = startedPlaylistVideoIndex;
    this.videoData = videoData;
  }

  public getVideoType(url: string | undefined): string {
    if (url?.includes(".m3u8")) {
      return "application/x-mpegURL";
    }
    return "video/mp4";
  }

  public playVideoSource(): string | undefined {
    if (this.playlistData && this.startedPlaylistVideoIndex) {
      return (
        this.playlistData.PlaylistHasVideo[
          parseInt(this.startedPlaylistVideoIndex ?? "1") - 1
        ]?.videoUrl ?? ""
      );
    } else if (this.videoData?.video?.videoUrl) {
      return this.videoData.video.videoUrl;
    }
  }

  public getThumbnailSource(): string | undefined {
    if (this.playlistData && this.startedPlaylistVideoIndex) {
      return (
        this.playlistData.PlaylistHasVideo[
          parseInt(this.startedPlaylistVideoIndex ?? "1") - 1
        ]?.thumbnailUrl ?? ""
      );
    } else if (this.videoData?.video?.thumbnailUrl) {
      return this.videoData.video.thumbnailUrl;
    }
  }

  public getSpriteThumbnails(): string[] | undefined {
    if (this.playlistData && this.startedPlaylistVideoIndex) {
      return this.playlistData.PlaylistHasVideo[
        parseInt(this.startedPlaylistVideoIndex ?? "1") - 1
      ]?.spriteThumbnails;
    } else if (this.videoData?.video?.spriteThumbnails) {
      return this.videoData.video.spriteThumbnails;
    }
  }
}

export default VideoPlayerHelper;
