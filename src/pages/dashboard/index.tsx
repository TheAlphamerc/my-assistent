import Image from "next/image";
import { Inter } from "next/font/google";
import Head from "next/head";
import FileUploadArea from "@/component/FileUploadArea";
import FileQandAArea from "@/component/FileQandAArea";
import { useEffect, useState } from "react";
import { FileLite } from "@/types/file";
import { Button } from "@/component/button";
import Link from "next/link";
import cx from "classnames";

import FileViewerList from "@/component/FileViewerList";
import NavbarLayout from "@/component/layout/navLayout";
import { useUser } from "@auth0/nextjs-auth0/client";

const inter = Inter({ subsets: ["latin"] });

export default function Z() {
  const [files, setFiles] = useState<FileLite[]>([]);
  const { user, error, isLoading } = useUser();

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/protected-api");

      const data = await res.json();

      if (res.status === 401) {
        console.log("You are not authorized to access this API");
      } else {
        console.log(data);
      }
    })();
  }, []);

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
              href={`assistant/${user?.sid}`}
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
