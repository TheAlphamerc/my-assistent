import { useRouter } from "next/router";
import ChatArea from "./ChatArea";
import { useEffect, useState } from "react";

interface Prop {
  id?: string;
  collectionId?: string;
  placeholder?: string;
  label?: string;
}
export default function Bot(props: Prop) {
  type Status = "idle" | "loading" | "error" | "success";
  const router = useRouter();
  const query = router.query as { id: string | undefined };
  const id = props.id ?? query.id;
  const [status, setStatus] = useState<Status>("idle");
  const [bot, setBot] = useState<any>();

  const isInvalid = !id;
  useEffect(() => {
    if (!id) return;
    async function fetchBot() {
      setStatus("loading");
      const res = await fetch(
        `/api/account/bot/get?botId=${id}&collectionId=${props.collectionId}`
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
  }, [bot, id, props.collectionId]);

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
    <div className="Assistant flex flex-col h-full rounded-3xl min-h-full">
      <div className="bg-slate-100 place-items-end lg:place-items-center h-full">
        {status === "loading" && <></>}
        {status === "error" && <></>}
        {status === "success" && (
          <ChatArea
            files={[]}
            bot={bot}
            label={props.label ?? bot.botName ?? "Pensil AI Assistant"}
            placeholder={
              props.placeholder ??
              `Ask me anything about ${bot.botName ?? "Pensil"}`
            }
            trainedDoc={id}
          />
        )}
      </div>
    </div>
  );
}
