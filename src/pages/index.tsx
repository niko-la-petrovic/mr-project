import "reactflow/dist/style.css";
import "react-tooltip/dist/react-tooltip.css";

import * as ort from "onnxruntime-web";

import {
  AiOutlineDelete,
  AiOutlineDownload,
  AiOutlinePlaySquare,
  AiOutlinePlusSquare,
} from "react-icons/ai";
import { Button, ButtonProps } from "@/components/buttons/button";
import { PlacesType, Tooltip } from "react-tooltip";
import { ReactNode, useEffect, useState } from "react";
import { curryRight, flow } from "lodash";

import { IconButton } from "@/components/buttons/iconbutton";
import Image from "next/image";
import { Inter } from "next/font/google";
import Jimp from "jimp";
import ReactFlow from "reactflow";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const initialNodes = [
  { id: "1", position: { x: 0, y: 0 }, data: { label: "1" } },
  { id: "2", position: { x: 0, y: 100 }, data: { label: "2" } },
];
const initialEdges = [{ id: "e1-2", source: "1", target: "2" }];

export default function Home() {
  const [imgSrc, setImgSrc] = useState<string | undefined>(undefined);
  // TODO add keyboard shortcuts
  // https://devtrium.com/posts/how-keyboard-shortcut
  useEffect(() => {
    Jimp.read("https://picsum.photos/200").then((image) => {
      image
        .resize(256, 256)
        .quality(60)
        .getBase64Async(Jimp.MIME_JPEG)
        .then((base64) => {
          console.log(base64);
          setImgSrc(base64);
        });
    });
  }, []);

  useEffect(() => {
    // TODO use onnx runtime
  }, []);

  const toolbarIconClass = "text-2xl";
  return (
    <div className={inter.className}>
      <div className="flex flex-col justify-center gap-4 p-4">
        <div className="flex justify-center items-center">
          <span className="text-4xl font-light">Image Flow</span>
        </div>
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
          <IconButton tooltip={{ id: "add", content: "Save" }}>
            <AiOutlineDownload className={toolbarIconClass} />
          </IconButton>
        </div>
        <div className="border border-black dark:border-white mt-0">
          <div className="h-screen w-screen">
            <ReactFlow nodes={initialNodes} edges={initialEdges} />
          </div>
        </div>
        <div>
          {imgSrc && <Image alt="test" src={imgSrc} width={256} height={256} />}
        </div>
      </div>
    </div>
  );
}
