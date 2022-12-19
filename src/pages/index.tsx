import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

import { trpc } from "../utils/trpc";
import Navbar from "../components/navbar";
import { NextPageWithLayout } from "./_app";
import { ReactElement } from "react";

const Home: NextPageWithLayout = () => {
  return (
    <>
      <Head>
        <title>Infinte Comics</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
    </>
  );
};

Home.getLayout = function getLayout(page: ReactElement) {
  return <Navbar>{page}</Navbar>;
};

export default Home;
