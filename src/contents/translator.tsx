import { IconZodiacGemini } from "@tabler/icons-react";
import { useEffect, useState } from "react";

import { useStorage } from "@plasmohq/storage/hook";

import { StorageKeys } from "~config/storage";
import { translateByV1 } from "~gemini/translater-v1";

export {};

console.log("Hello, world!");

const Translator = () => {
  const [apiKey, setApiKey] = useStorage(StorageKeys.API_KEY);
  const [showIcon, setShowIcon] = useState(false);

  useEffect(() => {
    window.addEventListener("mouseup", (event) => {
      const selection = window.getSelection();
      const selectionText = selection.toString().trim();
      if (!selectionText) return; // no text selected

      // get mouse position
      const { clientX, clientY } = event;
      console.log("clientX", clientX, "clientY", clientY);

      console.log("selectionText", selectionText);
      translateByV1({ apiKey });
    });

    return () => {
      window.removeEventListener("mouseup", () => {});
    };
  }, []);

  return showIcon && <IconZodiacGemini />;
};

export default Translator;
