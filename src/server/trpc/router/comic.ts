import { router, publicProcedure, protectedProcedure } from "../trpc";
import { any, z } from "zod";
import { TRPCError } from "@trpc/server";

export const comicRouter = router({
  createComic: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        author: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const prisma = ctx.prisma;

      const comic = await prisma.comic.create({
        data: {
          title: input.title,
          author: input.author,
        },
      });
    }),
  uploadComicAsset: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        comicImages: z.array(z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      //loop through the files, and upload them to supabase, then return the urls save them to the database

      const supabase = ctx.supabase;
      const prisma = ctx.prisma;
      let part = 0;
      const comicImages = input.comicImages.map(async (image) => {
        //upload to supabase
        const { data, error } = await supabase.storage
          .from("comic-asset")
          .upload(`comic-${input.id}-${part}.png`, image, {
            cacheControl: "3600",
            upsert: false,
          });
        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message,
          });
        }
        //get the url
        const { data: url } = await supabase.storage
          .from("comic-asset")
          .getPublicUrl(data.path);

        part++;
        return {
          comicId: input.id,
          part: part,
          comicUrl: url.publicUrl,
        };
      });
      //make comicImages an array of objects
      const comicUrls = await Promise.all(comicImages);

      //create many comic assets in the database connected to the comicID
      const comic = await prisma.asset.createMany({
        data: [...comicUrls],
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
