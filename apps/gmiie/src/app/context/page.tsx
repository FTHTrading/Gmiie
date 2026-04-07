import type { Metadata } from "next";
import ContextClientPage from "./ContextClientPage";

export const metadata: Metadata = {
  title: "Agent API — GMIIE Context Endpoint",
  description:
    "GMIIE's AI-ready context endpoint. A single GET request returns structured intelligence: top articles, signal scores, entity rankings, and stablecoin tracker states. Feed directly to Claude, GPT, or any MCP agent.",
};

export default function ContextPage() {
  return <ContextClientPage />;
}
