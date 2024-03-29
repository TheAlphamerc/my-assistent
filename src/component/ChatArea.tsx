import { Transition } from "@headlessui/react";
import axios from "axios";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { v4 as uuidv4 } from "uuid";
import { FileLite } from "../types/file";
import LoadingText from "./LoadingText";
import BotIcon from "./svg-icon/bot-icon";
import UserIcon from "./svg-icon/user-icon";
import { uniqueId } from "lodash";

type Conversation = {
  id?: string;
  userQuery?: string;
  assistant?: string;
  time?: string;
};

type FileQandAAreaProps = {
  files: FileLite[];
  label?: string;
  placeholder?: string;
  trainedDoc?: string;
  bot: any;
};

function ChatArea(props: FileQandAAreaProps) {
  const searchBarRef = useRef(null);
  const formRef = useRef(null);
  const listRef = useRef(null);
  const [answerError, setAnswerError] = useState("");
  const [searchResultsLoading, setSearchResultsLoading] =
    useState<boolean>(false);

  const [conversation, setConversation] = useState<Array<Conversation>>([]);

  const handleSearch = useCallback(async () => {
    if (searchResultsLoading) {
      return;
    }

    const question = (searchBarRef?.current as any)?.value ?? "";
    // Clear search bar

    if (!question) {
      return;
    } else if (props.trainedDoc) {
      setAnswerError("Sorry, something went wrong!, Please contact the admin");
    }
    setSearchResultsLoading(true);
    const time = new Date().toLocaleTimeString();
    var list = Array.from(conversation);

    list.push({
      userQuery: question,
      time: time,
      id: uuidv4(),
    });
    setConversation(list);
    window.scroll({
      top: document.body.offsetHeight,
      left: 0,
      behavior: "smooth",
    });
    setAnswerError("");

    try {
      const payload = {
        question,
        trainedDoc: props.trainedDoc,
        persona: props.bot.persona,
      };
      const answerResponse = await axios.post(`/api/get-answer`, payload, {
        timeout: 1000 * 120,
      });

      if (answerResponse.status === 200) {
        const answer = answerResponse.data.answer;
        const index = list.findIndex((item) => item.time === time);
        list[index] = {
          userQuery: question,
          assistant: answer,
          time: time,
          id: uuidv4(),
        };

        setConversation(list);
        window.scroll({
          top: document.body.offsetHeight,
          left: 0,
          behavior: "smooth",
        });
        (searchBarRef?.current as any).value = "";
      } else {
        setAnswerError("Sorry, something went wrong!");
      }
    } catch (err: any) {
      setAnswerError("Sorry, something went wrong!");
    }

    setSearchResultsLoading(false);
  }, [conversation, props.trainedDoc, searchResultsLoading, props.bot]);

  const handleEnterInSearchBar = useCallback(
    async (event: React.SyntheticEvent) => {
      if ((event as any).key === "Enter") {
        await handleSearch();
      }
    },
    [handleSearch]
  );

  useEffect(() => {
    if (conversation.length < 1) {
      return;
    }
    const conf = conversation[conversation.length - 1];
    if (!conf.id) return;
    const element = document.getElementById(conf.id);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
    } else {
    }
  }, [conversation, conversation.length]);

  if (!props.bot) {
    return <>Unable to load boat</>;
  }

  return (
    <div className="QAArea flex flex-col h-full w-full text-gray-800   rounded-lg">
      <div className="sticky top-0 p-2 border-b bg-white z-10">
        {props.label ?? "Ask a question based on the content of your files:"}
      </div>

      {/* ANSWERS */}
      <div className="flex-1 overflow-y-scroll">
        <div
          ref={listRef}
          className="flex flex-col gap-6 h-full overflow-y-auto p-4 prose prose-sm pb-8 max-w-full"
        >
          {answerError && (
            <div className="text-red-400 p-4 border  mt-4 border-red-300 shadow bg-white rounded">
              {answerError}
            </div>
          )}
          <Assistant
            conversation={{
              assistant: "Hello! How can I assist you today?",
            }}
          />
          {conversation.map((conversation, index) => (
            <div key={index} className=" bg-slate-100 flex flex-col gap-6 ">
              <User conversation={conversation} />
              <Assistant conversation={conversation} />
            </div>
          ))}
        </div>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
        ref={formRef}
        className="sticky bottom-0 bg-white py-2 flex items-center px-2 border-t"
      >
        <input
          required
          className=" rounded border-gray-200 py-1 px-2 w-full bg-transparent placeholder:text-gray-500 text-gray-900 text-sm font-light focus:outline-none"
          placeholder={
            props.placeholder ??
            "e.g. Hi, I am Pensil AI assistant, ask me anything about Pensil!"
          }
          name="search"
          ref={searchBarRef}
          onKeyDown={handleEnterInSearchBar}
        />
        <SendButton
          formRef={formRef}
          searchResultsLoading={searchResultsLoading}
        />
      </form>
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

function Assistant({ conversation }: { conversation: Conversation }) {
  return (
    <TransitionWrapper
      id={conversation.id}
      show={
        conversation.assistant != null && conversation.assistant != undefined
      }
    >
      <div className={`flex  gap-2 ${!conversation.assistant && "hidden"}`}>
        <div
          className="h-8 w-8 shrink-0 overflow-hidden rounded-xl text-white p-1.5"
          style={{ background: "#0445fe" }}
        >
          <BotIcon />
        </div>
        <span className="flex-1">
          <ReactMarkdown
            className="Markdown pose pose-sm list-disc list-inside max-w-full"
            linkTarget="_blank"
          >
            {conversation.assistant ?? ""}
          </ReactMarkdown>
        </span>
      </div>
    </TransitionWrapper>
  );
}

function User({ conversation }: { conversation: Conversation }) {
  return (
    <TransitionWrapper
      id={conversation.id}
      show={
        conversation.userQuery != null && conversation.userQuery != undefined
      }
    >
      <div className={`flex  gap-2 `}>
        <div className="flex items-center h-8 w-8 rounded-full text-white">
          <UserIcon />
        </div>
        <ReactMarkdown className="" linkTarget="_blank">
          {conversation.userQuery ?? ""}
        </ReactMarkdown>
      </div>
    </TransitionWrapper>
  );
}

function TransitionWrapper({
  children,
  show,
  id,
}: {
  children: React.ReactNode;
  show: boolean;
  id?: string;
}) {
  return (
    <Transition
      id={id}
      show={show}
      enter="transition duration-600 ease-out"
      enterFrom="transform opacity-0"
      enterTo="transform opacity-100"
      leave="transition duration-125 ease-out"
      leaveFrom="transform opacity-100"
      leaveTo="transform opacity-0"
    >
      {children}
    </Transition>
  );
}

export default memo(ChatArea);
