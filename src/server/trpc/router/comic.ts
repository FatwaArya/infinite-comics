import { router, publicProcedure, protectedProcedure } from "../trpc";
import { any, z } from "zod";
import { TRPCError } from "@trpc/server";

export const comicRouter = router({
  uploadComic: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        comicImages: z.array(z.string()),
      })
    )
    .mutation(({ input, ctx }) => {
      //loop through the files, and upload them to supabase, then return the urls save them to the database

      const supabase = ctx.supabase;
      const prisma = ctx.prisma;
      let part = 0;

      const comicImages = input.comicImages.map(async (image) => {
        const { data, error } = await supabase.storage
          .from("comic")
          .upload(`${input.id}-${part}`, image, {
            cacheControl: "3600",
            upsert: false,
          });
        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message,
          });
        }
        part++;
        return data;
      });

      console.log(comicImages);

      //   prisma.asset.create({
      //     data: {
      //       part: part,
      //       images: ,
      //     },
      //   });
    }),
});
