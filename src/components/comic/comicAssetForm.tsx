import { useState } from "react";
import { supabase } from "../../utils/supabase";
import { trpc } from "../../utils/trpc";
import { Combobox } from "@headlessui/react";
import { CheckIcon, SparklesIcon } from "@heroicons/react/24/solid";
import Example from "../comboBox";

function classNames(...classes: (string | boolean)[]) {
  return classes.filter(Boolean).join(" ");
}
interface Comic {
  id: string;
  title: string;
}

export default function ComicAssetForm() {
  const { data: comics } = trpc.comic.getComics.useQuery({});
  const createComicAsset = trpc.comic.uploadComicAsset.useMutation();
  const [query, setQuery] = useState("");

  const filteredComics =
    query === ""
      ? comics
      : comics?.filter((comic: Comic) => {
          comic.title.toLowerCase().includes(query.toLowerCase());
        });

  return (
    <>
      {" "}
      <form
        className="space-y-8 divide-y divide-gray-200"
        onSubmit={async (e) => {
          e.preventDefault();
          const target = e.target as typeof e.target & {
            title: { value: string; id: string };
            assetComic: { files: FileList };
          };

          //expect assetComic.files to be an array of files
          const assetComic = target.assetComic.files as FileList;
          const title = target.title.value;
          //store the path of the uploaded file on array of objects
          const asset = [];
          let part = 0;

          console.log(assetComic);

          //iterate through the files and upload them
          for (let i = 0; i < assetComic.length; i++) {
            const { data, error } = await supabase.storage
              .from("comic-asset")
              .upload(
                `comic-${title}-${assetComic[i]?.name}`,
                assetComic[i] as File
              );

            const { data: url } = supabase.storage
              .from("comic-cover")
              .getPublicUrl(data?.path ?? "");
            part++;

            asset.push({
              part,
              comicTitle: title,
              comicUrl: url.publicUrl,
            });
          }

          await createComicAsset.mutateAsync({
            comicAsset: asset,
          });
        }}
      >
        <div className="space-y-8 divide-y divide-gray-200">
          <div>
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Comic Asset
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Upload a new comic asset.
              </p>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <Combobox as="div" name="title" defaultValue={comics?.[0]?.id}>
                  <Combobox.Label className="block text-sm font-medium text-gray-700">
                    Title Assigned to
                  </Combobox.Label>
                  <div className="relative mt-1">
                    <Combobox.Input
                      className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                      onChange={(event) => setQuery(event.target.value)}
                    />
                    <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
                      <SparklesIcon
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </Combobox.Button>
                    {/*
      // @ts-ignore */}
                    {filteredComics?.length > 0 && (
                      <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {filteredComics?.map((comic) => (
                          <Combobox.Option
                            key={comic.id}
                            value={comic.title}
                            className={({ active }) =>
                              classNames(
                                "relative cursor-default select-none py-2 pl-3 pr-9",
                                active
                                  ? "bg-indigo-600 text-white"
                                  : "text-gray-900"
                              )
                            }
                          >
                            {({ active, selected }) => (
                              <>
                                <span
                                  className={classNames(
                                    "block truncate",
                                    selected && "font-semibold"
                                  )}
                                >
                                  {comic.title}
                                </span>

                                {selected && (
                                  <span
                                    className={classNames(
                                      "absolute inset-y-0 right-0 flex items-center pr-4",
                                      active ? "text-white" : "text-indigo-600"
                                    )}
                                  >
                                    <CheckIcon
                                      className="h-5 w-5"
                                      aria-hidden="true"
                                    />
                                  </span>
                                )}
                              </>
                            )}
                          </Combobox.Option>
                        ))}
                      </Combobox.Options>
                    )}
                  </div>
                </Combobox>
              </div>

              <div className="sm:col-span-6">
                <label
                  htmlFor="cover-photo"
                  className="block text-sm font-medium text-gray-700"
                >
                  Cover photo (optional)
                </label>
                <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="assetComic"
                        className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="assetComic"
                          name="assetComic"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          multiple
                        />
                      </label>
                      <p className="pl-1">or drag and dr sop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-5">
          <div className="flex justify-end">
            <button
              type="button"
              className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Save
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
