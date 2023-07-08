import "reactflow/dist/style.css";

import Image from "next/image";
import { Inter } from "next/font/google";
import ReactFlow from "reactflow";

const inter = Inter({ subsets: ["latin"] });

const initialNodes = [
  { id: "1", position: { x: 0, y: 0 }, data: { label: "1" } },
  { id: "2", position: { x: 0, y: 100 }, data: { label: "2" } },
];
const initialEdges = [{ id: "e1-2", source: "1", target: "2" }];

export default function Home() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ReactFlow nodes={initialNodes} edges={initialEdges} />
    </div>
  );
}
