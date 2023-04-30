import Image from "next/image";
import { Inter } from "next/font/google";
import Head from "next/head";
import FileUploadArea from "@/component/FileUploadArea";
import ChatArea from "@/component/ChatArea";
import { useEffect, useState } from "react";
import { FileLite } from "@/types/file";
import { Button } from "@/component/button";
import Link from "next/link";
import cx from "classnames";

import FileViewerList from "@/component/FileViewerList";
import NavbarLayout from "@/component/layout/navLayout";
import { useUser } from "@auth0/nextjs-auth0/client";

const inter = Inter({ subsets: ["latin"] });

export default function Dashboard() {
  const [files, setFiles] = useState<FileLite[]>([]);
  const { user, error, isLoading } = useUser();

  return (
    <div className="flex items-left text-left h-screen flex-col">
      <Head>
        <title>File</title>
      </Head>
      <NavbarLayout
        trailing={
          <Button variant={"outline"}>
            <Link href="/api/auth/logout">Logout</Link>
          </Button>
        }
      />

      <div className="flex flex-col items-center max-w-5xl mx-auto m-24 space-y-8 text-gray-800">
        <h1 className="text-4xl min-w-[500px]">Dashboard </h1>
        <div className="flex items-center w-full ">
          <Button variant={"ghost"} className="flex-1 rounded h-20  m-2 border">
            <Link
              href="dashboard/create"
              className="flex-1 flex items-center place-content-center   rounded h-20 w-14"
            >
              <div>
                <h2>Create new Bot</h2>
              </div>
            </Link>
          </Button>
          <Button variant={"ghost"} className="flex-1 rounded h-20  m-2 border">
            <Link
              // href={`assistant/${user?.sid}`}
              href={`dashboard/my-bots`}
              className="flex-1 flex items-center place-content-center   rounded h-20 w-14"
            >
              <div>
                <h2>View my Bot</h2>
              </div>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
