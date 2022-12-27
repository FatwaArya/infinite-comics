import { router, publicProcedure, protectedProcedure } from "../trpc";
import { any, z } from "zod";
import { TRPCError } from "@trpc/server";

const MAX_FILE_SIZE = 500000;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const comicRouter = router({
  getComics: protectedProcedure.input(z.object({})).query(async ({ ctx }) => {
    const prisma = ctx.prisma;
    //find only id and title
    return prisma.comic.findMany({
      select: {
        id: true,
        title: true,
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
            part: z.number(),
            comicTitle: z.string(),
            comicUrl: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      //loop through the files, and upload them to supabase, then return the urls save them to the database

      const prisma = ctx.prisma;
      console.log(input.comicAsset);
      const comic = await prisma.asset.createMany({
        data: [...input.comicAsset],
      });
    }),
  //using infiniteQuery to get all chapters on specific comic
  getComicInfinite: publicProcedure
    .input(
      z.object({
        id: z.string(),
        cursor: z.string().optional(),
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ input, ctx }) => {
      const prisma = ctx.prisma;
      const comic = await prisma.comic.findUnique({
        where: {
          id: input.id,
        },
        include: {
          assets: {
            take: input.limit,
            skip: input.cursor ? 1 : 0,
            cursor: input.cursor ? { id: input.cursor } : undefined,
          },
        },
      });
    }),
});
