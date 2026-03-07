import sharedConfig from "@xxxiii/ui/tailwind.config";
import type { Config } from "tailwindcss";
const config: Config = {
  ...sharedConfig,
  content: ["./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
};
export default config;
