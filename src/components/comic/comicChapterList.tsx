import { trpc } from "../../utils/trpc";
import ComicChapter from "./comicChapter";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocal from "dayjs/plugin/updateLocale";

dayjs.extend(relativeTime);
dayjs.extend(updateLocal);
const people = [
  {
    name: "Leslie Alexander",
    email: "leslie.alexander@example.com",
    role: "Co-Founder / CEO",
    imageUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
  {
    name: "Leslie Alexander",
    email: "leslie.alexander@example.com",
    role: "Co-Founder / CEO",
    imageUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
  // More people...
];
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
  title,
}: {
  title: string | undefined;
}) {
  const { data: chapters } = trpc.comic.getComicChapter.useQuery({
    comicTitle: title,
  });

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {chapters?.map((chapter) => (
          <ComicChapter
            id={chapter.id}
            chapter={chapter.chapter}
            uploadDate={dayjs(chapter.createdAt).fromNow()}
          />
        ))}
      </div>
    </>
  );
}
