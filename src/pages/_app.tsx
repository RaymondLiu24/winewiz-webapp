import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { retrieveAssistant } from '../../utils/openai.js';

export default function App({ Component, pageProps }: AppProps) {
  // Create an assistant instance
  retrieveAssistant();
  return <Component {...pageProps} />;
}

