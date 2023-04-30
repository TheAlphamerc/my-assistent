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

interface Props {
  bot: any;
}
export default function CreateBot({ bot }: Props) {
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
      <div className="flex flex-col items-center max-w-5xl mx-auto  space-y-8 text-gray-800">
        <div className=" w-full my-4">
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
          bot={bot}
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
