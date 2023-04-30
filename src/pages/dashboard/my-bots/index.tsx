import Image from "next/image";
import { Inter } from "next/font/google";
import Head from "next/head";
import FileUploadArea from "@/component/FileUploadArea";
import ChatArea from "@/component/ChatArea";
import { ReactNode, useEffect, useState } from "react";
import { FileLite } from "@/types/file";
import { Button } from "@/component/button";
import Link from "next/link";
import cx from "classnames";

import FileViewerList from "@/component/FileViewerList";
import NavbarLayout from "@/component/layout/navLayout";
import { useUser } from "@auth0/nextjs-auth0/client";
import getBots from "../../api/account/get-my-bots";
import GoBackButton from "@/component/atom/go-back-button";
import { ListView } from "@/component/compound/list-view";

const inter = Inter({ subsets: ["latin"] });

type Status = "idle" | "loading" | "success" | "error";
export default function ViewMyBots() {
  const [bots, setBots] = useState<Array<any>>([]);
  const [status, setStatus] = useState<Status>("idle");
  const { user, error, isLoading } = useUser();

  useEffect(() => {
    const getBots = async () => {
      setStatus("loading");
      const res = await fetch("/api/account/get-my-bots");
      const data = await res.json();

      if ([200, 304].includes(res.status)) {
        setStatus("success");
        setBots(data["myBots"]);
      } else if (res.status === 401) {
        console.error("You are not authorized to access this API");
        setStatus("error");
      } else {
        console.error("Something went wrong");
        setStatus("error");
      }
    };
    if (user) {
      getBots();
    }
  }, [user]);

  return (
    <div className="flex items-left text-left h-screen flex-col">
      <Head>
        <title>My bots</title>
      </Head>
      <NavbarLayout
        trailing={
          <Button variant={"outline"}>
            <Link href="/api/auth/logout">Logout</Link>
          </Button>
        }
      />

      <div className="flex flex-col self-start place-content-start max-w-5xl mx-auto m-24 space-y-8 text-gray-800">
        <GoBackButton className="my-6" />
        <h1 className="text-4xl min-w-[500px]">My Bots </h1>
        <div className="flex items-center w-full ">
          <ListView
            items={bots}
            loading={status === "loading"}
            className="flex flex-wrap gap-2"
            renderItem={function (bot: any, index: number): ReactNode {
              return (
                <Link
                  href={`/assistant/${bot?.botId}`}
                  className="flex-1 flex items-center place-content-center   rounded h-20 "
                >
                  <Button
                    key={index}
                    variant={"ghost"}
                    className="flex-1 rounded h-20  m-2 border"
                  >
                    <div>
                      <h2>{bot.botName}</h2>
                    </div>
                  </Button>
                </Link>
              );
            }}
            placeholder={<div>Loading...</div>}
            noItemsElement={<div>No bots found</div>}
          />
        </div>
      </div>
    </div>
  );
}
