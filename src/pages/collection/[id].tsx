import ChatArea from "@/component/ChatArea";
import { useRouter } from "next/router";

import React from "react";
import NavbarLayout from "@/component/layout/navLayout";
import Bot from "@/component/bot";
import { useUser } from "@auth0/nextjs-auth0/client";
import { Button } from "@/component/button";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import GoBackButton from "@/component/atom/go-back-button";

export default function Assistant() {
  const query = useRouter().query;
  console.log(query);
  const collectionId = query.id as string;
  const botId = query.bot as string;
  if (!botId) return <div>Invalid bot id</div>;

  return (
    <div className="h-screen flex flex-col gap-6 ">
      {/* <NavbarLayout /> */}

      <div className="h-full w-full mx-auto border rounded  overflow-hidden">
        <Bot id={botId} collectionId={collectionId} />
      </div>
    </div>
  );
}
