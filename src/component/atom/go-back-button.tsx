import React from "react";
import cx from "classnames";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/router";
import { Button } from "../button";
/**
 * Go back button
 */

export default function GoBackButton({ className }: { className?: string }) {
  const router = useRouter();
  return (
    <Button
      variant={"ghost"}
      className={cx("flex items-center gap-2 max-w-fit", className)}
      onClick={() => {
        router.back();
      }}
    >
      <ArrowLeftIcon className="text-black w-4 h-7" />
      <span>Back</span>
    </Button>
  );
}
