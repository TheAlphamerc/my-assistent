import React from "react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/router";
import { Button } from "../button";
/**
 * Go back button
 */

export default function GoBackButton() {
  const router = useRouter();
  return (
    <Button
      variant={"ghost"}
      className="flex items-center gap-2"
      onClick={() => {
        router.back();
      }}
    >
      <ArrowLeftIcon className="text-black w-4 h-7" />
      <span>Back</span>
    </Button>
  );
}
