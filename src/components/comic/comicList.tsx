import Image from "next/image";
import { trpc } from "../../utils/trpc";
import Link from "next/link";

export default function ComicList() {
  const { data: comics } = trpc.comic.getComics.useQuery({});

  return (
    <div>
      <div className="mx-auto max-w-2xl py-4 px-4 sm:py-8 sm:px-6 lg:max-w-7xl lg:px-8">
        <h2 className="sr-only">Products</h2>

        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {comics?.map((comic) => (
            <Link key={comic.id} href={`/comics/${comic.id}`} className="group">
              <Image
                src={comic.image || ""}
                alt={comic.title}
                height={412}
                width={288}
              />
              <h3 className="mt-4 text-sm text-gray-700">{comic.title}</h3>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
