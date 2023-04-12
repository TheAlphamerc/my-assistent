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
import GoBackButton from "@/component/atom/go-back-button";

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
        <div className=" w-full my-8">
          <GoBackButton />
        </div>
        <h1 className="text-4xl">Create Assistant using Assistant AI </h1>
        <div className="text-center max-w-xl">
          To search for answers from the content in your files, upload them here
          and we will use OpenAI embeddings and GPT to find answers from the
          relevant documents.
        </div>

        <FileUploadArea
          handleSetFiles={setFiles}
          maxNumFiles={75}
          maxFileSizeMB={30}
        />

        <FileViewerList
          files={files}
          title="Uploaded Files"
          listExpanded={false}
        />
      </div>
    </div>
  );
}
