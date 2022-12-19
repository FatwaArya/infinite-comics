import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

import { trpc } from "../utils/trpc";
import Navbar from "../components/navbar";

const Home: NextPage = () => {
  const { data: UserData } = useSession();

  return (
    <>
      <Head>
        <title>Infinte Comics</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        <Navbar data={UserData} />
      </div>
    </>
  );
};

export default Home;
