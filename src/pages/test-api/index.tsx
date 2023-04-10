import { useUser } from "@auth0/nextjs-auth0/client";
import Image from "next/image";
import { Inter } from "next/font/google";
import Head from "next/head";
import { Button } from "@/component/button";
import Link from "next/link";
import NavbarLayout from "@/component/layout/navLayout";
import { useCallback, useEffect, useRef, useState } from "react";
import LoadingText from "@/component/LoadingText";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  async function tesAPI() {
    const res = await fetch("/api/hello");

    const data = await res.json();

    if (res.status === 401) {
      console.log("You are not authorized to access this API");
    } else {
      console.log(data);
    }
  }

  return (
    <div className="flex items-left text-left h-screen flex-col">
      <Head>
        <title>Assistant AI</title>
      </Head>
      <NavbarLayout />
      <div className="flex flex-col items-center max-w-5xl mx-auto m-24 space-y-8 text-gray-800">
        <h1 className="text-4xl">Test API </h1>
        <div className="text-center max-w-xl">
          This is a test page to test the API endpoints for the assistant AI
        </div>

        <Button variant={"default"} onClick={tesAPI}>
          Text
        </Button>
      </div>
    </div>
  );
}

function SendButton({
  formRef,
  searchResultsLoading,
}: {
  formRef: React.RefObject<HTMLFormElement>;
  searchResultsLoading: boolean;
}) {
  return (
    <div className="flex flex-col place-content-between">
      <div
        className={`rounded-md bg-[#0445fe] py-1 px-4 w-max text-white hover:bg-[#0447fedf] border   ${
          searchResultsLoading ? "cursor-not-allowed" : "cursor-pointer"
        }`}
        onClick={(e) => {
          if (!searchResultsLoading) {
            (formRef?.current as any)?.requestSubmit();
          }
        }}
      >
        {searchResultsLoading ? (
          <LoadingText spinnerColor="fill-white" text="Thinking.." />
        ) : (
          "Ask"
        )}
      </div>
    </div>
  );
}
