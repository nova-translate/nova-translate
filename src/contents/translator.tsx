import { Textarea } from "@nextui-org/react";
import { IconZodiacGemini } from "@tabler/icons-react";
import cssText from "data-text:~style.css";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import { useStorage } from "@plasmohq/storage/hook";

import { TranslationType } from "~config/common";
import { StorageKeys } from "~config/storage";
import { translateByV1 } from "~gemini/translator-v1";

export const getStyle = () => {
  const style = document.createElement("style");
  style.textContent = cssText;
  return style;
};

const Translator = () => {
  const [apiKey, setApiKey] = useStorage(StorageKeys.API_KEY);
  const [sourceText, setSourceText] = useState("");
  const [freeTargetText, setFreeTargetText] = useState("");
  const [literalTargetText, setLiteralTargetText] = useState("");
  const [showEntryIcon, setEntryShowIcon] = useState(false);
  const [entryIconPosition, setEntryIconPosition] = useState({ x: 0, y: 0 });
  const [showPanel, setShowPanel] = useState(false);

  const getFreeTargetText = async () => {
    const result = await translateByV1({ apiKey, sourceText, type: TranslationType.FREE });
    setFreeTargetText(result.text);
  };

  const getLiteralTargetText = async () => {
    const result = await translateByV1({ apiKey, sourceText, type: TranslationType.LITERAL });
    setLiteralTargetText(result.text);
  };

  const handleEntryIconClick = () => {
    setShowPanel(true);
    getFreeTargetText();
    getLiteralTargetText();
  };

  const handleSourceTextChange = (value: string) => {
    setSourceText(value);
  };

  useEffect(() => {
    const handleMouseUp = (event: MouseEvent) => {
      // ignore if click on the extension element
      const target = event.target as HTMLElement;
      if (target.localName === "plasmo-csui") return;

      // wait for selection to be done
      setTimeout(() => {
        const selection = window.getSelection();
        const selectionText = selection.toString().trim();

        // no text selected
        if (!selectionText) {
          setEntryShowIcon(false);
          return;
        }

        // get mouse position
        const { clientX, clientY } = event;
        setEntryIconPosition({ x: clientX + 40, y: clientY + 10 });
        setSourceText(selectionText);
        setEntryShowIcon(true);
      }, 0);
    };

    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  useEffect(() => {
    const handleMouseClick = (event: MouseEvent) => {
      // do not hide if click on the extension element
      const target = event.target as HTMLElement;
      if (target.localName === "plasmo-csui") return;
      setShowPanel(false);
    };

    window.addEventListener("click", handleMouseClick);
    return () => {
      window.removeEventListener("click", handleMouseClick);
    };
  }, []);

  return (
    <>
      <AnimatePresence>
        {showEntryIcon && (
          <motion.div
            className="bg-white dark:bg-black dark:text-white rounded p-[2px] shadow-md cursor-pointer"
            initial={{ opacity: 0, x: entryIconPosition.x, y: entryIconPosition.y }}
            animate={{ opacity: 1, position: "fixed", x: entryIconPosition.x, y: entryIconPosition.y }}
            exit={{ opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 1 }}
            onClick={handleEntryIconClick}
          >
            <motion.div whileHover={{ rotate: 360 }}>
              <IconZodiacGemini size={20} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPanel && (
          <motion.div
            id="translator-panel"
            className="bg-white dark:bg-black dark:text-white w-[450px] rounded-md p-2 shadow-md"
            initial={{ opacity: 0, x: entryIconPosition.x, y: entryIconPosition.y }}
            animate={{ opacity: 1, position: "fixed", x: entryIconPosition.x + 30, y: entryIconPosition.y }}
            exit={{ opacity: 0 }}
          >
            <Textarea
              disableAutosize
              disableAnimation
              variant="bordered"
              value={sourceText}
              onValueChange={handleSourceTextChange}
              classNames={{ input: "resize-y min-h-[80px] text-xs" }}
            />
            {freeTargetText}
            <br />
            {literalTargetText}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Translator;
