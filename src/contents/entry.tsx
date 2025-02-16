import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Mousetrap from "mousetrap";
import { sendToBackground } from "@plasmohq/messaging";
import { Check, ChevronsUpDown, LoaderCircle } from "lucide-react";
import { LanguageEnum, Languages, MAX_TRANSLATION_LENGTH, PLASMO_CONTAINER_Z_INDEX } from "@/config/common";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { debounce } from "lodash-es";
import cssText from "data-text:@/styles/globals.css";

export const getStyle = () => {
  const style = document.createElement("style");
  style.textContent = cssText;
  return style;
};

const Entry = () => {
  const [targetLanguage, setTargetLanguage] = useState(LanguageEnum.Chinese);
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
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
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
      const { left, right, top, bottom } = rect;

      const selectedText = selection.toString().trim();
      const sourceText = selectedText.slice(0, MAX_TRANSLATION_LENGTH);

      setShowEntryPanel(true);
      setSourceTextRect({ left, right, top, bottom });
      getTranslatedText(sourceText);
    });
  }, []);

  // update entry panel position when scrolling
  useEffect(() => {
    const handleScroll = debounce(() => {
      if (!showEntryPanel) return;

      const selection = window.getSelection();
      const { isCollapsed } = selection;

      // no text selected
      if (isCollapsed) {
        setShowEntryPanel(false);
        return;
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const { left, right, top, bottom } = rect;

      setSourceTextRect({ left, right, top, bottom });
    }, 100);

    document.addEventListener("scroll", handleScroll);
    return () => document.removeEventListener("scroll", handleScroll);
  }, [showEntryPanel]);

  // hide entry panel
  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      // do not hide if click on the extension element
      const target = event.target as HTMLElement;
      if (target.localName === "plasmo-csui") return;

      setShowEntryPanel(false);
      setSourceTextRect({ left: 0, right: 0, top: 0, bottom: 0 });
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  return (
    <>
      <AnimatePresence>
        {showEntryPanel && (
          <motion.div
            className="fixed"
            initial={{ opacity: 0, x: entryPanelPosition.x, y: entryPanelPosition.y }}
            animate={{ opacity: 1, x: entryPanelPosition.x, y: entryPanelPosition.y }}
            exit={{ opacity: 0 }}
          >
            <div id="entry-panel-container" className="min-w-80 max-w-md py-2 px-3 border border-gray-500 shadow-lg rounded-md -translate-x-1/2 text-sm">
              <div>{translating ? <LoaderCircle className="animate-spin" /> : targetText}</div>
              <Separator className="my-2" />
              <div className="flex justify-end">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-32 justify-between", !targetLanguage && "text-muted-foreground")}>
                      {targetLanguage ? Languages.find((language) => language.value === targetLanguage)?.label : "Select language"}
                      <ChevronsUpDown className="opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-32 p-0">
                    <Command>
                      <CommandInput placeholder="Search" className="h-9" />
                      <CommandList>
                        <CommandEmpty>No language found.</CommandEmpty>
                        <CommandGroup>
                          {Languages.map((language) => (
                            <CommandItem value={language.label} key={language.value} onSelect={() => setTargetLanguage(language.value)}>
                              {language.label}
                              <Check className={cn("ml-auto", language.value === targetLanguage ? "opacity-100" : "opacity-0")} />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Entry;
