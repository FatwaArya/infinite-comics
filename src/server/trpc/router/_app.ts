import { router } from "../trpc";
import { authRouter } from "./auth";
import { comicRouter } from "./comic";

export const appRouter = router({
  auth: authRouter,
  comic: comicRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
