import { Handle, Position, useReactFlow } from "reactflow";
import {
  ImageFlowData,
  ImageFlowEdgeData,
  ImageFlowNodeProps,
} from "@/types/domain";

import { AiOutlineDownload } from "react-icons/ai";
import { IconButton } from "../buttons/iconButton";
import Image from "next/legacy/image";
import Input from "../inputs/input";
import { downloadNodeImage } from "@/services/downloadNodeImage";
import { updateNodeLabel } from "@/services/updateNodeLabel";
import { useCallback } from "react";

// TODO make into container component

export function CustomImageFlowNode({ id, data }: ImageFlowNodeProps) {
  const { setNodes } = useReactFlow<ImageFlowData, ImageFlowEdgeData>();

  const content = data.content;
  const showPreview = content?.showPreview;
  const memo = content?.memo;
  const image = data.content?.memo?.image;

  const onNodeLabelChange = useCallback(
    (label: string) => updateNodeLabel(id, label, setNodes),
    [id, setNodes]
  );

  const onDownloadImage = useCallback(() => {
    if (!image) {
      console.debug("no image");
      return;
    }

    downloadNodeImage(image, id);
  }, [id, image]);

  return (
    <>
      <Handle type="target" position={Position.Top} />
      <div className="flex flex-col justify-center items-center p-4 bg-white dark:bg-slate-900 relative rounded gap-4 border-2 border-gray-400 hover:border-primary-600 transition-all duration-300 ease-in-out">
        <span className="absolute top-0 left-0 text-xs font-semibold pl-2 pt-2 opacity-20">
          {id}
        </span>
        <Input type="text" value={data.label} onChange={onNodeLabelChange} />
        {showPreview && memo ? (
          <>
            <div className="s-64 relative">
              <Image
                className="absolute top-0 left-0 w-full h-full object-contain"
                src={memo.thumbnail}
                alt=""
                layout="fill"
              />
            </div>
            {memo.thumbnailDigest && (
              <div className="flex items-center gap-2">
                <span>{memo.thumbnailDigest}</span>
                <IconButton>
                  <AiOutlineDownload
                    className="text-lg"
                    onClick={onDownloadImage}
                  />
                </IconButton>
              </div>
            )}
          </>
        ) : (
          <div className="">
            {/* TODO loader */}
            <span>No flow yet</span>
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} id="a" />
    </>
  );
}
