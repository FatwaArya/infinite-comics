import { GetServerSidePropsContext } from "next";
import { getServerAuthSession } from "../../server/common/get-server-auth-session";
import { NextPageWithLayout } from "../_app";
import { env } from "../../env/server.mjs";
import Head from "next/head";
import { useSession } from "next-auth/react";
import { DashboardLayout } from "../../components/dasboardLayout";
import ComicForm from "../../components/comic/comicForm";

const DashboardComic: NextPageWithLayout = () => {
  const { data: Admin } = useSession();
  return (
    <>
      <Head>
        <title>Dashboard | {Admin?.user?.name}</title>
      </Head>
      <div>
        <ComicForm />
      </div>
    </>
  );
};

DashboardComic.getLayout = function getLayout(page) {
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

export default DashboardComic;
