import { useRouter } from "next/router";
import { NextPageWithLayout } from "../_app";
import Navbar from "../../components/navbar";
import { RouterInputs, RouterOutputs, trpc } from "../../utils/trpc";
import { useScrollPosition } from "../../hooks/useScrollPosition";
import { QueryClient, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import Image from "next/image";
import Head from "next/head";
const Limit = 10;

const ComicPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { id } = router.query;

  const scrollPosition = useScrollPosition();

  const { data, hasNextPage, fetchNextPage, isFetching } =
    trpc.comic.getComicInfinite.useInfiniteQuery(
      {
        id: id as string,
        limit: Limit,
      },
      {
        getNextPageParam: (lastPage) => {
          if (lastPage?.comics?.length?.[0] < Limit) {
            return undefined;
          }
          return lastPage?.comics?.[lastPage?.comics?.length - 1]?.id;
        },
      }
    );
  const comics = data?.pages.flatMap((page) => page?.comics) ?? [];

  useEffect(() => {
    if (scrollPosition > 90 && hasNextPage && !isFetching) {
      fetchNextPage();
    }
  }, [scrollPosition, hasNextPage, isFetching, fetchNextPage]);

  return (
    <>
      <Head>
        <title>Comic</title>
      </Head>
      <div>
        {comics.map((comic) => (
          <div key={comic?.id} className="flex justify-center">
            <Image
              src={comic?.comicUrl || ""}
              alt={"good comics"}
              className="object-cover object-center group-hover:opacity-75"
              height={202}
              width={802}
            />
          </div>
        ))}
        {!hasNextPage && <p>No more items to load</p>}
      </div>
    </>
  );
};

ComicPage.getLayout = function getLayout(page) {
  return <Navbar>{page}</Navbar>;
};

export default ComicPage;
