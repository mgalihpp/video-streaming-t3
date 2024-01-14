// import { postRouter } from "@/server/api/routers/post";
import { createTRPCRouter } from "@/server/api/trpc";
import { videoRouter } from "./routers/video";
import { videoEngagementRouter } from "./routers/videoEngagement";
import { userRouter } from "./routers/user";
import { commentRouter } from "./routers/comment";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  //   post: postRouter,
  video: videoRouter,
  user: userRouter,
  comment: commentRouter,
  videoEngagement: videoEngagementRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
