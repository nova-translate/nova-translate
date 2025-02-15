import { useEffect, useState } from "react";
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
  const [entryPanelPosition, setEntryPanelPosition] = useState({ x: 0, y: 0 });

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

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const selectedText = selection.toString().trim();

      setSourceText(selectedText);
      setShowEntryPanel(true);
      setEntryPanelPosition({ x: rect.left + rect.width + 8, y: rect.bottom + 8 });
      getTranslatedText(selectedText);
    });
  }, []);

  // hide entry panel
  useEffect(() => {
    const handleMouseClick = (event: MouseEvent) => {
      setSourceText("");
      setShowEntryPanel(false);
      setEntryPanelPosition({ x: 0, y: 0 });
    };

    document.addEventListener("click", handleMouseClick);
    return () => document.removeEventListener("click", handleMouseClick);
  }, []);

  return (
    <>
      <AnimatePresence>
        {showEntryPanel && (
          <motion.div className="fixed" initial={{ opacity: 0, x: entryPanelPosition.x, y: entryPanelPosition.y }} whileInView={{ opacity: 1 }}>
            <div className="py-1 px-2 border border-gray-800 shadow rounded bg-white text-black">
              {translating ? <Loader2 className="animate-spin" /> : targetText}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Entry;
