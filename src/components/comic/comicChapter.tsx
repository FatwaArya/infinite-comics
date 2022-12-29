export default function ComicChapter({
  id,
  chapter,
  uploadDate,
}: {
  id: string | undefined;
  chapter: number;
  uploadDate: string;
}) {
  return (
    <>
      <div
        key={id}
        className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:border-gray-400"
      >
        <div className="min-w-0 flex-1">
          <a href="#" className="focus:outline-none">
            <span className="absolute inset-0" aria-hidden="true" />
            <p className="text-sm font-medium text-gray-900">
              chapter {chapter}
            </p>
            <p className="truncate text-sm text-gray-500">{uploadDate}</p>
          </a>
        </div>
      </div>
    </>
  );
}
