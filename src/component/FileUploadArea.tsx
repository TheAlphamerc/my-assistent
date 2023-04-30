import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useState,
  memo,
  useRef,
  useEffect,
} from "react";
import cx from "classnames";
import axios from "axios";
import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import { compact, filter, uniqBy } from "lodash";

import LoadingText from "./LoadingText";
import { FileLite } from "../types/file";
import FileViewerList from "./FileViewerList";
import extractTextFromFile from "@/services/extractTextFromFile";
import { Button } from "./button";
import { UserProfile, useUser } from "@auth0/nextjs-auth0/client";
import { Input } from "./atom/inout";
import { Textarea } from "./atom/textarea";
import { useRouter } from "next/router";

type FileUploadAreaProps = {
  handleSetFiles: Dispatch<SetStateAction<FileLite[]>>;
  maxNumFiles: number;
  maxFileSizeMB: number;
  bot?: any;
};

function FileUploadArea(props: FileUploadAreaProps) {
  const handleSetFiles = props.handleSetFiles;

  const { user, isLoading } = useUser();
  const router = useRouter();

  const [botId, setBotId] = useState("");
  const [files, setFiles] = useState<FileLite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const dropzoneRef = useRef<HTMLLabelElement>(null);
  const botNameRef = useRef<HTMLInputElement>(null);
  const botDescriptionRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (props.bot) {
      setBotId(props.bot.botId);
      botNameRef.current!.value = props.bot.botName;
      botDescriptionRef.current!.value = props.bot.persona;
    }
  }, [props.bot]);

  // const uploadAPIUrl = "http://127.0.0.1:5000/train_file";
  const uploadAPIUrl =
    "https://open-bot-server-thealphamerc.vercel.app/train_file";

  const handleFileChange = useCallback(
    async (selectedFiles: FileList | null) => {
      if (!user) {
        console.log("User not logged in");
        return;
      } else if (!botNameRef.current?.value) {
        console.log("Bot name is not set");
        return;
      }
      console.log("handleFileChange", selectedFiles);

      if (selectedFiles && selectedFiles.length > 0) {
        setError("");

        if (files.length + selectedFiles.length > props.maxNumFiles) {
          setError(`You can only upload up to ${props.maxNumFiles} files.`);
          if (dropzoneRef.current) {
            (dropzoneRef.current as any).value = "";
          }
          console.log(`You can only upload up to ${props.maxNumFiles} files.`);
          return;
        }
        console.log("Initiate Upload");
        setLoading(true);

        // const botId = botId ??  await generateBotId(user);
        // if (!botId) {
        //   console.error("Error generating bot id");
        //   return;
        // }
        let tempBotId = botId;
        if (!tempBotId) {
          tempBotId = await generateBotId(user);
        }

        const uploadedFiles = await Promise.all(
          Array.from(selectedFiles).map(async (file) => {
            // Check the file type
            if (
              file.type.match(
                /(text\/plain|application\/(pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document)|text\/(markdown|x-markdown))/
              ) && // AND file isn't too big
              file.size < props.maxFileSizeMB * 1024 * 1024
            ) {
              // Check if the file name already exists in the files state
              // if (files.find((f) => f.name === file.name)) {
              //   console.log("File already exists");
              //   return null; // Skip this file
              // }

              const formData = new FormData();
              formData.append("file", file);
              formData.append("id", tempBotId as string);

              try {
                console.log("Sending file to server", formData);
                const processFileResponse = await axios.post(
                  uploadAPIUrl,
                  formData,
                  {
                    headers: {
                      "Content-Type": "multipart/form-data",
                    },
                    timeout: 1000 * 140,
                  }
                );

                if (processFileResponse.status === 200) {
                  const text = processFileResponse.data.text;
                  const meanEmbedding = processFileResponse.data.meanEmbedding;
                  const chunks = processFileResponse.data.chunks;

                  const fileObject: FileLite = {
                    name: file.name,
                    url: URL.createObjectURL(file),
                    type: file.type,
                    size: file.size,
                    expanded: false,
                    embedding: meanEmbedding,
                    chunks,
                    extractedText: text,
                  };
                  console.log(fileObject);

                  return fileObject;
                } else {
                  console.log("Error creating file embedding");
                  return null;
                }
              } catch (err: any) {
                console.log(`Error creating file embedding: ${err}`);
                return null;
              }
            } else {
              alert(
                `Invalid file type or size. Only TXT, PDF, DOCX or MD are allowed, up to ${props.maxFileSizeMB}MB.`
              );
              return null; // Skip this file
            }
          })
        ).catch((err: any) => {
          console.log(`Error uploading file: ${err}`);
          return null;
        });

        // Filter out any null values from the uploadedFiles array
        const validFiles = compact(uploadedFiles);

        // Set the files state with the valid files and the existing files
        handleSetFiles((prevFiles) => [...prevFiles, ...validFiles]);

        updateBot([...files, ...validFiles], tempBotId, user);

        // Clear the file input
        if (dropzoneRef.current) {
          (dropzoneRef.current as any).value = undefined;
        }

        // Filter the file from files using loadash uniqBy
        const remainingFile = filter(files, (file) => {
          return !validFiles.find((f) => f.name === file.name);
        });

        // Set the files state with the remaining files
        setFiles(remainingFile);

        setLoading(false);
        console.log("Upload Complete");
        router.push("/dashboard/my-bots");
      } else {
        if (props.bot) {
          setLoading(true);
          await updateBot(files, botId, user);
          setLoading(false);
        }
        console.log("no files selected");
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      botId,
      files,
      handleSetFiles,
      props.maxFileSizeMB,
      props.maxNumFiles,
      router,
      user,
    ]
  );

  async function generateBotId(user: UserProfile) {
    const res = await fetch("/api/account/generate-bot-id", {
      method: "POST",
      body: JSON.stringify({ user }),
    });

    const data = await res.json();
    console.log(data);
    return data?.newBotId;
  }

  async function updateBot(
    list: Array<FileLite>,
    botId: string,
    user: UserProfile
  ) {
    if (!user) {
      console.log("User not logged in");
      return;
    } else if (!botNameRef.current?.value) {
      console.log("Bot name is not set");
      return;
    }
    if (props.bot.docs) {
      list = [...props.bot.docs, ...list];
    }
    const validFiles = compact(list);
    if (validFiles.length < 1) {
      console.log("No files to update");
      return;
    }
    const files = validFiles.map((file) => {
      return {
        name: file.name,
        size: file.size,
        type: file.type,
      };
    });
    // Remove any duplicate files
    const uniqueFiles = uniqBy(files, "name");

    const res = await fetch("/api/account/bot/update", {
      method: "POST",
      body: JSON.stringify({
        files: uniqueFiles,
        botId,
        user,
        botName: botNameRef.current?.value ?? "Untitled Bot",
        persona: botDescriptionRef.current?.value,
        status: "published",
        webUrl: "",
      }),
    });

    const data = await res.json();
    if (res.status === 200) {
      console.log("Bot updated", { data });
    } else {
      console.log("Error updating bot", { data });
    }
  }

  const handleDragEnter = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setDragOver(false);
      const droppedFiles = event.dataTransfer.files;
      // handleFileChange(droppedFiles);
      const selectedFiles = files.concat(Array.from(droppedFiles));
      setFiles(selectedFiles);
    },
    [files]
  );

  return (
    <div className="flex items-center justify-center w-full flex-col gap-5 max-w-2xl">
      <div className="flex flex-col gap-2 w-full">
        <label htmlFor="name" className="font-medium">
          Name{" "}
        </label>
        <Input
          id="name"
          placeholder="Enter bot name"
          required
          ref={botNameRef}
        />
      </div>
      <div className="flex flex-col gap-1 w-full">
        <label htmlFor="description" className="font-medium">
          Description{" "}
        </label>
        <Textarea
          id="description"
          ref={botDescriptionRef}
          placeholder="Enter some desc"
          className="w-full"
        />
        <small className="text-gray-500">
          This description helps chatbot to understand the context and his role.
          <br />
          For ex. &quot;You are <em>(Product Name)</em> AI assistant, designed
          to answer the question about <em>(Product Name)</em>.&quot;
        </small>
      </div>
      <label
        htmlFor="dropzone-file"
        className={`flex flex-col shadow items-center justify-center w-full h-36 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 relative ${
          dragOver ? "border-blue-500 bg-blue-50" : ""
        }`}
        ref={dropzoneRef}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          {loading ? (
            <LoadingText text="Uploading..." />
          ) : (
            <div className="text-gray-500 flex flex-col items-center text-center">
              <ArrowUpTrayIcon className="w-7 h-7 mb-4" />
              <p className="mb-2 text-sm">
                <span className="font-semibold">Click to upload</span> or drag
                and drop
              </p>
              <p className="text-xs">
                TXT, PDF, DOCX or MD (max {props.maxFileSizeMB}MB per file)
              </p>
              <p className="text-xs mt-1">
                You can upload up to {props.maxNumFiles - files.length} more{" "}
                {props.maxNumFiles - files.length === 1 ? "file" : "files"}
              </p>
              <input
                id="dropzone-file"
                type="file"
                className="hidden"
                multiple
                onChange={(event) => {
                  if (event.target.files) {
                    const selectedFiles = files
                      .concat(Array.from(event.target.files))
                      .slice(0, props.maxNumFiles);
                    // remove duplicates from the array
                    const uniqueFiles = uniqBy(selectedFiles, "name");
                    setFiles(uniqueFiles);
                  }
                }}
              />
            </div>
          )}
        </div>
      </label>

      {error && (
        <div className="flex items-center justify-center w-full mt-4">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      <FileViewerList
        files={files}
        title="Selected Files"
        listExpanded={false}
        onRemoveFile={(file) => {
          const newFiles = files.filter((f) => f.name !== file.name);
          setFiles(newFiles);
        }}
      />

      <div className="w-full flex place-content-end">
        <Button
          disabled={isLoading}
          onClick={() => {
            handleFileChange(files as any);
            // updateBot(files, "df989cb4-c33a-4d9b-821a-ca45a4b85af0", user!);
          }}
        >
          {loading ? (
            <LoadingText
              spinnerColor="fill-white"
              text={props.bot ? "Updating.." : "Creating.."}
            />
          ) : props.bot ? (
            "Update"
          ) : (
            "Create"
          )}
        </Button>
      </div>
    </div>
  );
}

export default memo(FileUploadArea);
