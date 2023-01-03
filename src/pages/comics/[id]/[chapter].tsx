import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { NextPageWithLayout } from "../../_app";
import { useScrollPosition } from "../../../hooks/useScrollPosition";
import { trpc } from "../../../utils/trpc";
import Navbar from "../../../components/navbar";

const Limit = 2;

const ComicPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { id, chapter } = router.query;

  const scrollPosition = useScrollPosition();

  const { data, hasNextPage, fetchNextPage, isFetching } =
    trpc.comic.getComicInfinite.useInfiniteQuery(
      {
        id: id as string,
        limit: Limit,
        chapter: parseInt(chapter as string),
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
              loading="lazy"
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
