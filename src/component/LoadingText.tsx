import React, { memo } from "react";

import LoadingSpinner from "./LoadingSpinner";

type LoadingTextProps = {
  text: string;
  spinnerColor?: string;
};

function LoadingText(props: LoadingTextProps) {
  return (
    <div className=" text-md flex flex-row justify-center items-center">
      <LoadingSpinner color={props.spinnerColor} />
      {props.text && <div className="flex">{props.text}</div>}
    </div>
  );
}

export default memo(LoadingText);
