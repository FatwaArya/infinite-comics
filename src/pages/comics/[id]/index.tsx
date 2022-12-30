import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import Navbar from "../../../components/navbar";
import { trpc } from "../../../utils/trpc";
import { NextPageWithLayout } from "../../_app";
import ComicChapterList from "../../../components/comic/comicChapterList";

const ComicPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { id } = router.query;

  const { data: comic } = trpc.comic.getComic.useQuery({
    id: id as string,
  });

  return (
    <>
      <Head>
        <title>{comic?.title} on Infinte Comics</title>
      </Head>
      <div>
        <div className="my-16 flex flex-col items-center md:flex-row md:items-start">
          <Image
            src={comic?.image || ""}
            alt={comic?.title || ""}
            height={28}
            width={288}
          />
          <div className="px-4 ">
            <h1 className="text-center text-2xl font-bold text-gray-900 md:text-left">
              {comic?.title}
            </h1>
            <p>{comic?.description}</p>
          </div>
        </div>
        <ComicChapterList title={comic?.title} titleId={comic?.id} />
      </div>
    </>
  );
};

ComicPage.getLayout = function getLayout(page) {
  return <Navbar>{page}</Navbar>;
};

export default ComicPage;
