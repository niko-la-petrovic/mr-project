import "reactflow/dist/style.css";

import { useEffect, useState } from "react";

import Image from "next/image";
import { Inter } from "next/font/google";
import Jimp from "jimp";
import ReactFlow from "reactflow";
import dynamic from "next/dynamic";

const inter = Inter({ subsets: ["latin"] });

const initialNodes = [
  { id: "1", position: { x: 0, y: 0 }, data: { label: "1" } },
  { id: "2", position: { x: 0, y: 100 }, data: { label: "2" } },
];
const initialEdges = [{ id: "e1-2", source: "1", target: "2" }];

export default function Home() {
  const [imgSrc, setImgSrc] = useState<string | undefined>(undefined);
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

  return (
    <>
      <div>
        {imgSrc && <Image alt="test" src={imgSrc} width={256} height={256} />}
      </div>
      <div className="border-4 border-black">
        <div style={{ width: "100vw", height: "100vh" }}>
          <ReactFlow nodes={initialNodes} edges={initialEdges} />
        </div>
      </div>
    </>
  );
}
