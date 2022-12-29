import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Navbar from "../../components/navbar";
import { useScrollPosition } from "../../hooks/useScrollPosition";
import { trpc } from "../../utils/trpc";
import { NextPageWithLayout } from "../_app";
import ComicChapterList from "../../components/comic/comicChapterList";
const Limit = 2;

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

  const { data: comic } = trpc.comic.getComic.useQuery({
    id: id as string,
  });

  const comics = data?.pages.flatMap((page) => page?.comics) ?? [];

  useEffect(() => {
    if (scrollPosition > 90 && hasNextPage && !isFetching) {
      fetchNextPage();
    }
  }, [scrollPosition, hasNextPage, isFetching, fetchNextPage]);
  //        {comics.map((comic) => (
  //     <div key={comic?.id} className="flex justify-center">
  //     {/* make separate line if there a change in comic chapter*/}
  //     {comic?.chapter !== comics[comics.indexOf(comic) - 1]?.chapter && (
  //       <div className="flex justify-center">
  //         <h1 className="text-2xl font-bold text-gray-900">
  //           {comic?.chapter}
  //         </h1>
  //       </div>
  //     )}
  //     <Image
  //       src={comic?.comicUrl || ""}
  //       alt={"good comics"}
  //       className="object-cover object-center group-hover:opacity-75"
  //       height={202}
  //       width={802}
  //     />
  //   </div>
  // ))}
  // {!hasNextPage && <p>No more items to load</p>}
  return (
    <>
      <Head>
        <title>{comic?.title} on Infinte Comics</title>
      </Head>
      <div>
        <ComicChapterList title={comic?.title} />
      </div>
    </>
  );
};

ComicPage.getLayout = function getLayout(page) {
  return <Navbar>{page}</Navbar>;
};

export default ComicPage;
