import { trpc } from "../../utils/trpc";
import ComicChapter from "./comicChapter";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocal from "dayjs/plugin/updateLocale";
import Link from "next/link";

dayjs.extend(relativeTime);
dayjs.extend(updateLocal);

dayjs.updateLocale("en", {
  relativeTime: {
    future: "in %s",
    past: "%s",
    s: "1m",
    m: "1m",
    mm: "%dm",
    h: "1h",
    hh: "%dh",
    d: "1d",
    dd: "%d days",
    M: "1M",
    MM: "%dM",
    y: "1y",
    yy: "%dy",
  },
});
export default function ComicChapterList({
  titleId,
  title,
}: {
  titleId: string | undefined;
  title: string | undefined;
}) {
  const { data: chapters } = trpc.comic.getComicChapter.useQuery({
    comicTitle: title,
  });

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {chapters?.map((chapter) => (
          <Link href={`/comics/${titleId}/${chapter.chapter}`} key={chapter.id}>
            <ComicChapter
              id={chapter.id}
              chapter={chapter.chapter}
              uploadDate={dayjs(chapter.createdAt).fromNow()}
            />
          </Link>
        ))}
      </div>
    </>
  );
}
