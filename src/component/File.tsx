import { useState, useCallback, memo } from "react";
import cx from "classnames";
import {
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  ArrowTopRightOnSquareIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import { FileLite } from "../types/file";
import { round } from "lodash";

type FileProps = {
  file: FileLite;
  onRemoveFile?: (file: FileLite) => void;
  showScore?: boolean;
};

function File(props: FileProps) {
  const [expanded, setExpanded] = useState(false);

  var size = props.file.size! / 1024;
  var unit = "Kb";

  if (size > 1024) {
    size = size / 1024;
    size = Math.round(size * 100) / 100;
    unit = "Mb";
  } else if (size > 1024 * 1024) {
    size = size / 1024 / 1024;
    size = Math.round(size * 100) / 100;
    unit = "Gb";
  }

  const handleExpand = useCallback(() => {
    if (props.file.url) {
      setExpanded((prev) => !prev);
    }
  }, [props.file.url]);

  return (
    <div
      className="border-gray-100 border rounded-md shadow p-2 cursor-pointer"
      onClick={handleExpand}
    >
      <div className="flex flex-row ">
        <div className="flex-1 flex items-center gap-4">
          <div className="flex hover:text-gray-600">{props.file.name}</div>
          <div className="flex hover:text-gray-600">
            {round(size, 2)} &nbsp;
            {unit}
          </div>
        </div>

        <div
          className={cx("flex flex-row space-x-2", {
            hidden: !props.file.url,
          })}
        >
          {props.showScore && props.file.score && (
            <div className="flex text-blue-600 mr-4">
              {props.file.score.toFixed(2)}
            </div>
          )}

          <div className="ml-auto w-max flex items-center justify-center">
            {expanded ? (
              <MagnifyingGlassMinusIcon className="text-gray-500 h-5" />
            ) : (
              <MagnifyingGlassPlusIcon className="text-gray-500 h-5" />
            )}
          </div>

          <a
            href={props.file.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()} // prevent the click event from bubbling up to the list item
          >
            <ArrowTopRightOnSquareIcon className="text-gray-500 h-5" />
          </a>
        </div>

        {/* Remove file */}
        <div
          className={cx("flex items-center justify-center", {
            hidden: !props.onRemoveFile,
          })}
        >
          <XMarkIcon
            className={cx(
              "w-5 h-5 ml-2 stroke-slate-400 transition-transform cursor-pointer rounded hover:bg-gray",
              {
                hidden: props.file.embedding,
              }
            )}
            onClick={() => {
              props.onRemoveFile && props.onRemoveFile(props.file);
            }}
          />
        </div>
      </div>

      <div>
        <div
          className={cx("items-center mt-2 justify-center", {
            hidden: !expanded,
          })}
        >
          <iframe
            src={props.file.url}
            className="h-full w-full"
            title={props.file.name}
          ></iframe>
        </div>
      </div>
    </div>
  );
}

export default memo(File);
