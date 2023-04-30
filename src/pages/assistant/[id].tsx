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
  const { user, error, isLoading, checkSession } = useUser();
  const [isEdit, setIsEdit] = React.useState(false);

  const router = useRouter();
  const query = router.query as { id: string | undefined };
  const id = query.id;

  if (isLoading) return <div>Loading...</div>;

  if (!id) return <div>Invalid assistant Id</div>;

  if (error) return <div>{error.message}</div>;

  if (!user) return <div>Not logged in</div>;

  return (
    <div className="h-screen flex flex-col gap-6">
      <NavbarLayout
        trailing={
          <>
            {" "}
            <Button
              variant={"ghost"}
              onClick={() => {
                router.push("/dashboard/create", undefined, { shallow: true });
              }}
            >
              <Link href={`/dashboard/edit/${id}`}>Edit</Link>
            </Button>
            <Button variant={"ghost"}>
              <Link href="/api/auth/logout">Logout</Link>
            </Button>
          </>
        }
      />
      <div className=" w-[400px] mx-auto">
        <GoBackButton />
      </div>
      <div className="h-[550px] w-[400px] mx-auto border rounded  overflow-hidden">
        <Bot id={id} />
      </div>
    </div>
  );
}
