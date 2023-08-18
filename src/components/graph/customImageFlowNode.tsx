import { Handle, Position, useReactFlow } from "reactflow";
import {
  ImageFlowData,
  ImageFlowEdgeData,
  ImageFlowNodeProps,
} from "@/types/domain";
import { saveBase64ToFile, saveBlobToFile } from "@/services/saveFile";

import { AiOutlineDownload } from "react-icons/ai";
import { IconButton } from "../buttons/iconButton";
import Image from "next/legacy/image";
import Input from "../inputs/input";
import _ from "lodash";
import { deepNodeTransformById } from "@/services/nodeOps";
import { getImageUrlAsync } from "@/services/imageOps";
import { useCallback } from "react";

// TODO make into container component

export function CustomImageFlowNode({ id, data }: ImageFlowNodeProps) {
  const { setNodes, getEdge } = useReactFlow<
    ImageFlowData,
    ImageFlowEdgeData
  >();
  const updateNodeLabel = useCallback(
    (label: string) =>
      setNodes((nodes) =>
        deepNodeTransformById(nodes, id, (node) => ({
          ...node,
          data: { ...node.data, label },
        }))
      ),
    [id, setNodes]
  );

  const content = data.content;
  const showPreview = content?.showPreview;
  const memo = content?.memo;

  const downloadImage = useCallback(() => {
    const image = data.content?.memo?.image;
    if (!image) {
      console.debug("no image");
      return;
    }
    // TODO error or warning if no image
    // TODO extract into reusable function
    getImageUrlAsync(image).then((url) => {
      if (!url) return;
      fetch(url)
        .then((response) => response.blob())
        .then((blob) => {
          saveBlobToFile([blob], "image/png", "image.png");
        });
    });
  }, [data.content?.memo?.image]);

  return (
    <>
      <Handle type="target" position={Position.Top} />
      <div className="flex flex-col justify-center items-center p-4 bg-white dark:bg-slate-900 relative rounded gap-4 border-2 border-gray-400 hover:border-primary-600 transition-all duration-300 ease-in-out">
        <span className="absolute top-0 left-0 text-xs font-semibold pl-2 pt-2 opacity-20">
          {id}
        </span>
        <Input
          type="text"
          value={data.label}
          onChange={(value) => updateNodeLabel(value)}
        />
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
                    onClick={downloadImage}
                  />
                </IconButton>
              </div>
            )}
          </>
        ) : (
          <div className="">
            <span>No flow yet</span>
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} id="a" />
    </>
  );
}
