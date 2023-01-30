import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../trpc";

export const comicRouter = router({
  getComic: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const prisma = ctx.prisma;
      return prisma.comic.findUnique({
        where: {
          id: input.id,
        },
      });
    }),
  getComicChapter: publicProcedure
    .input(
      z.object({
        comicId: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const prisma = ctx.prisma;
      return prisma.asset.findMany({
        where: {
          comicId: input.comicId,
        },
        distinct: ["chapter"],
        select: {
          id: true,
          chapter: true,
          part: true,
          createdAt: true,
        },
        orderBy: {
          chapter: "desc",
        },
      });
    }),
  getComics: publicProcedure.input(z.object({})).query(async ({ ctx }) => {
    const prisma = ctx.prisma;

    const comics = prisma.comic.findMany({
      select: {
        id: true,
        title: true,
        image: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return comics;
  }),
  createComic: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
        //image is a file
        image: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const prisma = ctx.prisma;
      return prisma.comic.create({
        data: {
          title: input.title,
          description: input.description,
          image: input.image,
        },
      });
    }),
  uploadComicAsset: protectedProcedure
    .input(
      z.object({
        comicAsset: z.array(
          z.object({
            chapter: z.number(),
            part: z.number(),
            comicId: z.string(),
            comicUrl: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const prisma = ctx.prisma;
      return await prisma.asset.createMany({
        data: [...input.comicAsset],
      });
    }),
  //using infiniteQuery to get all chapters on specific comic
  getComicInfinite: publicProcedure
    .input(
      z.object({
        id: z.string().nullish(),
        chapter: z.number().nullish(),
        cursor: z.string().nullish(),
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ input, ctx }) => {
      const prisma = ctx.prisma;
      const cursor = input.cursor;
      const comics = prisma.comic.findUnique({
        where: {
          id: input.id ? input.id : undefined,
        },
        include: {
          assets: {
            where: {
              chapter: input.chapter ? input.chapter : undefined,
            },
            take: input.limit + 1,
            skip: input.cursor ? 1 : 0,
            cursor: input.cursor ? { id: input.cursor } : undefined,
          },
        },
      });
      let nextCursor: typeof cursor | undefined = undefined;
      const comic = await comics;

      if (comic?.assets?.length > input.limit) {
        nextCursor = comic?.assets[input.limit - 1]?.id;
      }
      return {
        comics: comic?.assets,
        nextCursor,
      };
    }),
});
