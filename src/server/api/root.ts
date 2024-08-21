import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { videoRouter } from "@/server/api/routers/video";
import { videoEngagementRouter } from "@/server/api/routers/videoEngagement";
import { userRouter } from "@/server/api/routers/user";
import { playlistRouter } from "@/server/api/routers/playlist";
import { commentRouter } from "@/server/api/routers/comment";
import { annoucementRouter } from "@/server/api/routers/annoucement";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  video: videoRouter,
  videoEngagement: videoEngagementRouter,
  user: userRouter,
  playlist: playlistRouter,
  comment: commentRouter,
  annoucement: annoucementRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
