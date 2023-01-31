import { GetServerSidePropsContext } from "next";
import { getServerAuthSession } from "../../server/common/get-server-auth-session";
import { NextPageWithLayout } from "../_app";
import { env } from "../../env/server.mjs";
import Head from "next/head";
import { useSession } from "next-auth/react";
import { DashboardLayout } from "../../components/dasboardLayout";
import { supabase } from "../../utils/supabase";
import { trpc } from "../../utils/trpc";
import { Fragment, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon, } from "@heroicons/react/24/solid";

function classNames(...classes: (string | boolean)[]) {
  return classes.filter(Boolean).join(" ");
}

const Dashboard: NextPageWithLayout = () => {
  const { data: Admin } = useSession();
  const createComic = trpc.comic.createComic.useMutation();
  const createComicAsset = trpc.comic.uploadComicAsset.useMutation();

  const { data: comics, refetch } = trpc.comic.getComics.useQuery({});

  const [selectedComic, setSelectedComic] = useState(comics?.[1] ?? null)
  const [chapter, setChapter] = useState(1);
  const [comicAsset, setComicAsset] = useState<FileList>();
  //invalidate comics 
  const utils = trpc.useContext();

  // const [query, setQuery] = useState("");
  // const filteredComics =
  //   query === ""
  //     ? comics
  //     : comics?.filter((comic: Comic) => {
  //       comic.title.toLowerCase().includes(query.toLowerCase());
  //     });

  // filteredComics as Comic[];
  return (
    <>
      <Head>
        <title>Dashboard | {Admin?.user?.name}</title>
      </Head>
      <div>
        <form
          className="space-y-8 divide-y divide-gray-200"
          onSubmit={async (e) => {
            e.preventDefault();
            const target = e.target as typeof e.target & {
              title: { value: string };
              description: { value: string };
              coverComic: { files: FileList };
            };

            const title = target.title.value;
            const description = target.description.value;
            const coverComic = target.coverComic.files[0] as File;

            console.log(title)

            const { data: path } = await supabase.storage
              .from("comic-cover")
              .upload(`comic-${title}`, coverComic);

            const { data: url } = supabase.storage
              .from("comic-cover")
              .getPublicUrl(path?.path ?? "");

            await createComic.mutateAsync(
              {
                title,
                description,
                image: url.publicUrl,
              },
              {
                onSuccess: () => {
                  utils.comic.getComics.invalidate();
                },
              }
            );

            target.title.value = "";
            target.description.value = "";
            target.coverComic.files = new DataTransfer().files;
          }}
        >
          <div className="space-y-8 divide-y divide-gray-200">
            <div>
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Comic
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Register a new comic.
                </p>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-4">
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Title
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="text"
                      name="title"
                      id="title"
                      autoComplete="title"
                      className="block w-full min-w-0 flex-1  rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Description
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      defaultValue={""}
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Write a synopsis of comic.
                  </p>
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
                          htmlFor="coverComic"
                          className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500"
                        >
                          <span>Upload a file</span>
                          <input
                            id="coverComic"
                            name="coverComic"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
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

        {/* asset */}


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

                <Listbox value={selectedComic} onChange={setSelectedComic}>
                  {({ open }) => (
                    <>
                      <Listbox.Label className="block text-sm font-medium text-gray-700">Assigned to</Listbox.Label>
                      <div className="mt-1 relative">
                        <Listbox.Button className="bg-white relative w-full border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                          <span className="block truncate">
                            {/* if the selectedComis is null add string */}
                            {selectedComic ? selectedComic.title : 'Select a comic'}
                          </span>
                          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                          </span>
                        </Listbox.Button>

                        <Transition
                          show={open}
                          as={Fragment}
                          leave="transition ease-in duration-100"
                          leaveFrom="opacity-100"
                          leaveTo="opacity-0"
                        >
                          <Listbox.Options className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                            {comics && comics.map((comic) => (
                              <Listbox.Option
                                key={comic.id}
                                className={({ active }) =>
                                  classNames(
                                    active ? 'text-white bg-indigo-600' : 'text-gray-900',
                                    'cursor-default select-none relative py-2 pl-3 pr-9'
                                  )
                                }
                                value={comic}
                              >
                                {({ selected, active }) => (
                                  <>
                                    <span className={classNames(selected ? 'font-semibold' : 'font-normal', 'block truncate')}>
                                      {comic.title}
                                    </span>

                                    {selected ? (
                                      <span
                                        className={classNames(
                                          active ? 'text-white' : 'text-indigo-600',
                                          'absolute inset-y-0 right-0 flex items-center pr-4'
                                        )}
                                      >
                                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                      </span>
                                    ) : null}
                                  </>
                                )}
                              </Listbox.Option>
                            ))}
                          </Listbox.Options>
                        </Transition>
                      </div>
                    </>
                  )}
                </Listbox>

              </div>

              <div className="sm:col-span-4">
                <label
                  htmlFor="chapter"
                  className="block text-sm font-medium text-gray-700"
                >
                  Chapter
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="number"
                    value={chapter}
                    onChange={(e) => { setChapter(e.target.valueAsNumber) }}
                    autoComplete="title"
                    min={1}
                    className="block w-full min-w-0 flex-1  rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
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
                          onChange={(e) => {
                            //push file list to state
                            const newFileList = e.target.files
                            if (newFileList) {
                              setComicAsset(newFileList)
                            }
                          }}
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
              onClick={async (e) => {
                e.preventDefault();
                // const target = e.target as typeof e.target & {
                //   title: { value: string, id: string }
                //   assetComic: { files: FileList };
                //   chapter: { value: string };
                // };

                const assetComicsLength = comicAsset?.length as number
                const assetComics = comicAsset
                const titleId = selectedComic?.id


                //store the path of the uploaded file on array of objects
                const asset = [];
                let part = 0;

                console.log(titleId)


                //iterate through the files and upload them
                for (let i = 0; i < assetComicsLength; i++) {
                  const { data } = await supabase.storage
                    .from("comic-asset")
                    .upload(
                      `comic-${titleId}-${assetComics?.[i]?.name}-${chapter}-${part}`,
                      assetComics?.[i] as File
                    );

                  const { data: url } = supabase.storage
                    .from("comic-asset")
                    .getPublicUrl(data?.path as string);

                  part++;


                  asset.push({
                    chapter: parseInt(chapter.toString()),
                    part,
                    comicId: titleId as string,
                    comicUrl: url.publicUrl,
                  });
                }

                await createComicAsset.mutateAsync(
                  {
                    comicAsset: asset,
                  },
                  {
                    onSuccess: () => {
                      alert("success");
                    },
                  }
                );
              }}
              className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Save
            </button>
          </div>
        </div>

      </div>
    </>
  );
};

Dashboard.getLayout = function getLayout(page) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getServerAuthSession(ctx);

  if (session?.user?.id !== env.ADMIN_ID) {
    return {
      redirect: {
        permanent: false,
        destination: "/",
      },
    };
  }

  return {
    props: {
      session,
    },
  };
}

export default Dashboard;
