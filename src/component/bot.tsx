import { useRouter } from "next/router";
import FileQandAArea from "./FileQandAArea";

interface Prop {
  id?: string;
  placeholder?: string;
  label?: string;
}
export default function Bot(props: Prop) {
  const router = useRouter();
  const query = router.query as { id: string | undefined };
  const id = query.id ?? props.id;

  const isInvalid = !id;
  if (isInvalid) {
    return (
      <div className="">
        <div className={`border-b p-4 text-gray-8=700 `}>
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
      <div className="bg-slate-100 grid min-h-full place-items-end lg:place-items-center">
        <FileQandAArea
          files={[]}
          label={props.label ?? "Pensil AI Assistant"}
          placeholder={props.placeholder ?? "Ask me anything about Pensil"}
          trainedDoc={id}
        />
      </div>
    </div>
  );
}
