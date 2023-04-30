import { useRouter } from "next/router";

import Bot from "@/component/bot";

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
