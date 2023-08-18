import {
  AiOutlineDelete,
  AiOutlineDownload,
  AiOutlinePlaySquare,
  AiOutlinePlusSquare,
} from "react-icons/ai";

import { IconButton } from "../buttons/iconButton";

const toolbarIconClass = "text-2xl";

export interface FlowToolbarProps {
  downloadOutputImages: () => void;
}

export default function FlowToolbar({
  downloadOutputImages,
}: FlowToolbarProps) {
  return (
    <div className="flex justify-start gap-1 z-10">
      {/* TODO add shortcut descriptors to each of these */}
      <IconButton tooltip={{ id: "add", content: "Add" }}>
        <AiOutlinePlusSquare className={toolbarIconClass} />
      </IconButton>
      <IconButton tooltip={{ id: "add", content: "Remove" }}>
        <AiOutlineDelete className={toolbarIconClass} />
      </IconButton>
      <IconButton tooltip={{ id: "add", content: "Run" }}>
        <AiOutlinePlaySquare className={toolbarIconClass} />
      </IconButton>
      <IconButton
        tooltip={{ id: "add", content: "Save" }}
        onClick={downloadOutputImages}
      >
        <AiOutlineDownload className={toolbarIconClass} />
      </IconButton>
    </div>
  );
}
