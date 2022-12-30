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
        comicTitle: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const prisma = ctx.prisma;
      return prisma.asset.findMany({
        where: {
          comicTitle: input.comicTitle,
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
    //find only id and title
    return prisma.comic.findMany({
      select: {
        id: true,
        title: true,
        image: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
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
            comicTitle: z.string(),
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
        id: z.string(),
        chapter: z.number(),
        cursor: z.string().optional(),
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ input, ctx }) => {
      const prisma = ctx.prisma;
      const cursor = input.cursor;
      const comics = prisma.comic.findUnique({
        where: {
          id: input.id,
        },
        include: {
          assets: {
            where: {
              chapter: input.chapter,
            },
            take: input.limit + 1,
            skip: input.cursor ? 1 : 0,
            cursor: input.cursor ? { id: input.cursor } : undefined,
            orderBy: {
              chapter: "asc",
            },
          },
        },
      });
      let nextCursor: typeof cursor | undefined = undefined;
      const comic = (await comics) as any;

      if (comic?.assets?.length > input.limit) {
        nextCursor = comic?.assets[input.limit - 1]?.id;
      }
      return {
        comics: comic?.assets,
        nextCursor,
      };
    }),
});
