import FileUploadArea from "@/component/FileUploadArea";
import { Button } from "@/component/button";
import { FileLite } from "@/types/file";
import { Inter } from "next/font/google";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";

import FileViewerList from "@/component/FileViewerList";
import GoBackButton from "@/component/atom/go-back-button";
import NavbarLayout from "@/component/layout/navLayout";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/router";
import LoadingSpinner from "@/component/LoadingSpinner";

const inter = Inter({ subsets: ["latin"] });

export default function EditBot() {
  const [files, setFiles] = useState<FileLite[]>([]);
  const { user, error, isLoading } = useUser();

  type Status = "idle" | "loading" | "error" | "success";
  const router = useRouter();
  const query = router.query as {
    id: string | undefined;
    collectionId: string | undefined;
  };
  const collectionId = query.collectionId;
  const id = query.id;
  const [status, setStatus] = useState<Status>("idle");
  const [bot, setBot] = useState<any>();

  const isInvalid = !id;
  useEffect(() => {
    if (!id) return;
    async function fetchBot() {
      setStatus("loading");
      const res = await fetch(
        `/api/account/bot/get?botId=${id}&collectionId=${collectionId}`
      );
      const data = await res.json();
      if ([200, 304].includes(res.status)) {
        setStatus("success");
        setBot(data["bot"]);
      } else {
        setStatus("error");
        setBot(null);
        console.error("Something went wrong", data);
      }
    }
    if (!bot) {
      fetchBot();
    }
  }, [bot, collectionId, id]);

  if (isInvalid) {
    return (
      <div className="">
        <div className={`border-b p-4 text-gray-700 `}>
          Invalid assistant Id
        </div>
        <div className="p-4 text-gray-400">
          <p className="text-gray-700 text-sm">
            Please check the assistant Id and try again.
          </p>
          <p className="text-gray-700 text-sm">
            If you think this is a bug, please report it to us. Thank you!
          </p>
        </div>
      </div>
    );
  }

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
      {status === "loading" && (
        <LoadingSpinner className="flex items-center place-content-center py-96" />
      )}
      {status === "error" && <>Error</>}
      {status === "success" && (
        <div className="flex flex-col items-center max-w-5xl mx-auto  space-y-8 text-gray-800">
          <div className=" w-full my-4">
            <GoBackButton />
          </div>
          <h1 className="text-4xl">Edit Assistant using Assistant AI </h1>
          <div className="text-center max-w-xl">
            To search for answers from the content in your files, upload them
            here and we will use OpenAI embeddings and GPT to find answers from
            the relevant documents.
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
      )}
    </div>
  );
}
