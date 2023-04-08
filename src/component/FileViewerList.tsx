import React, { memo, useCallback, useState } from "react";
import { ChevronUpIcon, XMarkIcon } from "@heroicons/react/24/outline";
import cx from "classnames";

import File from "./File";
import { FileLite } from "../types/file";

type FileViewerListProps = {
  files: FileLite[];
  title: string;
  listExpanded?: boolean;
  showScores?: boolean;
  onRemoveFile?: (file: FileLite) => void;
};

function FileViewerList(props: FileViewerListProps) {
  const [listExpanded, setListExpanded] = useState(props.listExpanded ?? false);

  const handleListExpand = useCallback(() => {
    setListExpanded((prev) => !prev);
  }, []);

  return (
    <div className="flex items-left justify-center w-full">
      {props.files.length > 0 && (
        <div className="flex flex-col items-left justify-center w-full mt-4">
          <div className="flex flex-row">
            <div
              className="rounded-md flex shadow p-2 mb-2 w-full bg-gray-50 items-center cursor-pointer "
              onClick={handleListExpand}
            >
              {props.title}
              <div className="bg-gray-300 ml-2 px-2 rounded-full w-max text-center text-sm ">
                {props.files.length}
              </div>
            </div>
            {/* Remove file icon */}

            <div className="ml-auto w-max flex items-center justify-center">
              <ChevronUpIcon
                className={cx(
                  "w-6 h-6 ml-2 stroke-slate-400 transition-transform cursor-pointer",
                  !listExpanded && "-rotate-180"
                )}
                onClick={handleListExpand}
              />
            </div>
          </div>

          <div
            className={cx("transition-all ", {
              hidden: !listExpanded,
            })}
          >
            <div className="text-sm text-gray-500 space-y-2">
              {props.files.map((file) => (
                <File
                  key={file.name}
                  file={file}
                  showScore={props.showScores}
                  onRemoveFile={props.onRemoveFile}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(FileViewerList);
