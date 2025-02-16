import { useEffect, useMemo, useState } from "react";
import cssText from "data-text:@/styles/globals.css";
import { AnimatePresence, motion } from "motion/react";
import Mousetrap from "mousetrap";
import { sendToBackground } from "@plasmohq/messaging";
import { Loader2 } from "lucide-react";

export const getStyle = () => {
  const style = document.createElement("style");
  style.textContent = cssText;
  return style;
};

const Entry = () => {
  const [sourceText, setSourceText] = useState("");
  const [targetText, setTargetText] = useState("");
  const [translating, setTranslating] = useState(false);
  const [showEntryPanel, setShowEntryPanel] = useState(false);
  const [sourceTextRect, setSourceTextRect] = useState({ left: 0, right: 0, top: 0, bottom: 0 });

  // bottom middle of the selected text
  const entryPanelPosition = useMemo(() => {
    return {
      x: sourceTextRect.left + (sourceTextRect.right - sourceTextRect.left) / 2,
      y: sourceTextRect.bottom + 10
    };
  }, [sourceTextRect.left, sourceTextRect.right, sourceTextRect.bottom]);

  const getTranslatedText = async (selectedText: string) => {
    setTranslating(true);

    const response = await sendToBackground({
      name: "ai",
      body: {
        text: selectedText
      }
    });

    setTranslating(false);
    setTargetText(response.text);
  };

  // get text from selection and show entry panel
  useEffect(() => {
    Mousetrap.bind("option+n", () => {
      const selection = window.getSelection();
      const { isCollapsed } = selection;

      // no text selected
      if (isCollapsed) {
        setShowEntryPanel(false);
        return;
      }

      const selectedText = selection.toString().trim();
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const { left, right, top, bottom } = rect;

      setSourceText(selectedText);
      setShowEntryPanel(true);
      setSourceTextRect({ left, right, top, bottom });
      getTranslatedText(selectedText);
    });
  }, []);

  // hide entry panel
  useEffect(() => {
    const handleMouseClick = (event: MouseEvent) => {
      setSourceText("");
      setShowEntryPanel(false);
      setSourceTextRect({ left: 0, right: 0, top: 0, bottom: 0 });
    };

    document.addEventListener("click", handleMouseClick);
    return () => document.removeEventListener("click", handleMouseClick);
  }, []);

  return (
    <>
      <AnimatePresence>
        {showEntryPanel && (
          <motion.div className="fixed" initial={{ opacity: 0, x: entryPanelPosition.x, y: entryPanelPosition.y }} whileInView={{ opacity: 1 }}>
            <div className="max-w-md py-2 px-3 border border-gray-800 shadow rounded bg-white text-black -translate-x-1/2 text-sm">
              {translating ? <Loader2 className="animate-spin" /> : targetText}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Entry;
