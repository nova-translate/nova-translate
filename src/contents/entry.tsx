import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Mousetrap from "mousetrap";
import { debounce, split, uniqueId, map, join } from "lodash-es";
import { ArrowRight, Check, ChevronsUpDown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useStorage } from "@plasmohq/storage/hook";
import { usePort } from "@plasmohq/messaging/hook";
import { StorageKeys } from "@/config/storage";
import { MessageTypes } from "@/config/message";
import { cn } from "@/lib/utils";
import { LanguageEnum, Languages, MAX_TRANSLATION_LENGTH, TextTypes } from "@/config/common";

import cssText from "data-text:@/styles/contents.css";
import type { SingleWordInfoType } from "@/background/ports/ai";

export const getStyle = () => {
  const style = document.createElement("style");
  style.textContent = cssText;
  return style;
};

const Entry = () => {
  const aiPort = usePort("ai");
  const [context, setContext] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [textId, setTextId] = useState("");
  const [textType, setTextType] = useState("");
  const [targetText, setTargetText] = useState("");
  const [targetWordData, setTargetWordData] = useState<SingleWordInfoType>();
  const [errorMessage, setErrorMessage] = useState("");
  const [showEntryPanel, setShowEntryPanel] = useState(false);
  const [sourceTextRect, setSourceTextRect] = useState({ left: 0, right: 0, top: 0, bottom: 0 });
  const [languageOptionsOpen, setLanguageOptionsOpen] = useState(false);
  const [shortcut] = useStorage<string>(StorageKeys.SHORTCUT, "alt+shift+n");
  const [targetLanguage, setTargetLanguage] = useStorage(StorageKeys.TARGET_LANGUAGE, (value) => {
    if (value === undefined) return LanguageEnum.English;
    return value;
  });
  const [learningModeState, setLearningModeState] = useStorage<boolean>(StorageKeys.LEARNING_MODE);

  // bottom middle of the selected text
  const entryPanelPosition = useMemo(() => {
    return {
      x: sourceTextRect.left + (sourceTextRect.right - sourceTextRect.left) / 2 - 200,
      y: sourceTextRect.bottom + 10
    };
  }, [sourceTextRect.left, sourceTextRect.right, sourceTextRect.bottom]);

  const getTranslatedText = async (selectedText: string, selectedTextContext: string) => {
    const id = uniqueId();
    const textType = split(selectedText, " ").length > 1 ? TextTypes.LONG_TEXT : TextTypes.SINGLE_WORD;

    setTextId(id);
    setTextType(textType);
    setTargetText("");
    setErrorMessage("");
    setTargetWordData(undefined);

    aiPort.send({
      uniqueId: id,
      textType,
      text: selectedText,
      context: selectedTextContext
    });
  };

  const handleTargetLanguageChange = (language: LanguageEnum) => {
    setTargetLanguage(language);
    getTranslatedText(sourceText, context);
  };

  const handleLearningModeChange = (value: boolean) => {
    setLearningModeState(value);
  };

  // listen to the AI port for stream result from background
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const listener = aiPort.listen((message) => {
      const { messageType, data } = message;

      if (messageType === MessageTypes.TRANSLATE_TEXT_PART) {
        const { uniqueId, textType, text, wordData } = data;
        if (uniqueId !== textId) return;

        if (textType === TextTypes.SINGLE_WORD) {
          setTargetWordData(wordData);
        }

        if (textType === TextTypes.LONG_TEXT) {
          setTargetText((prev) => {
            return prev + text;
          });
        }
      }

      if (messageType === MessageTypes.TRANSLATE_TEXT_ERROR) {
        const { uniqueId, error } = data;
        if (uniqueId !== textId) return;
        setErrorMessage(error.message);
      }
    });

    return () => listener.disconnect();
  }, [textId]);

  // get text from selection and show entry panel
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    Mousetrap.bind(shortcut, () => {
      const selection = window.getSelection();
      if (!selection) return;

      const { isCollapsed } = selection;

      // no text selected
      if (isCollapsed) {
        setShowEntryPanel(false);
        return;
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const { left, right, top, bottom } = rect;

      let selectedTextContext = "";
      const ContentLength = 100;
      const startNode = range.startContainer;

      if (startNode.nodeType === Node.TEXT_NODE) {
        const fullText = startNode.textContent || "";
        const startOffset = Math.max(range.startOffset - ContentLength, 0);
        const endOffset = Math.min(range.endOffset + ContentLength, fullText.length);
        selectedTextContext = fullText.slice(startOffset, endOffset);
        setContext(selectedTextContext);
      }

      let selectedText = selection.toString().trim();
      selectedText = selectedText.slice(0, MAX_TRANSLATION_LENGTH);

      setShowEntryPanel(true);
      setSourceTextRect({ left, right, top, bottom });
      setSourceText(selectedText);
      getTranslatedText(selectedText, selectedTextContext);
    });

    return () => {
      Mousetrap.unbind(shortcut);
    };
  }, [shortcut]);

  // update entry panel position when scrolling the page
  useEffect(() => {
    const handleScroll = debounce(() => {
      if (!showEntryPanel) return;

      const selection = window.getSelection();
      if (!selection) return;

      const { isCollapsed } = selection;

      // no text selected
      if (isCollapsed) return;

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const { left, right, top, bottom } = rect;

      setSourceTextRect({ left, right, top, bottom });
    }, 100);

    document.addEventListener("scroll", handleScroll);
    return () => document.removeEventListener("scroll", handleScroll);
  }, [showEntryPanel]);

  // hide entry panel when click outside
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
            className="fixed -translate-x-1/2 w-[400px] py-2 px-3 shadow-lg rounded-lg base-background base-border base-font"
            initial={{ opacity: 0, x: entryPanelPosition.x, y: entryPanelPosition.y }}
            animate={{ opacity: 1, x: entryPanelPosition.x, y: entryPanelPosition.y }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Button disabled variant="outline" size={"sm"} className={cn("justify-between", !targetLanguage && "text-muted-foreground")}>
                  <div className="w-24 overflow-hidden overflow-ellipsis text-left">Any Language</div>
                  <ChevronsUpDown className="opacity-50" />
                </Button>
                <ArrowRight size={20} className="mx-2" />
                <Popover open={languageOptionsOpen} onOpenChange={setLanguageOptionsOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size={"sm"} className={cn("w-28 justify-between", !targetLanguage && "text-muted-foreground")}>
                      <div className="overflow-hidden overflow-ellipsis text-left">{Languages.find((language) => language.value === targetLanguage)?.label}</div>
                      <ChevronsUpDown className="opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-28 p-0">
                    <Command>
                      {/* <CommandInput placeholder="Search" className="h-9" /> */}
                      <CommandList>
                        <CommandEmpty>No language found.</CommandEmpty>
                        <CommandGroup>
                          {Languages.map((language) => (
                            <CommandItem
                              value={language.label}
                              key={language.value}
                              onSelect={() => {
                                handleTargetLanguageChange(language.value);
                                setLanguageOptionsOpen(false);
                              }}
                            >
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

            <Separator className="my-3 bg-slate-300/70 dark:bg-slate-200/70" />

            {textType === TextTypes.LONG_TEXT && <div className="min-h-6">{targetText}</div>}
            {textType === TextTypes.SINGLE_WORD && (
              <div className="min-h-6">
                <div className="flex items-center mb-1">
                  {targetWordData && <span className="mr-3 text-[18px] font-bold">{sourceText}</span>}
                  {targetWordData?.pronunciation && <span className="mr-2 text-slate-600">[{targetWordData?.pronunciation}]</span>}
                </div>
                <div className="flex text-gray-800 h-[12px] items-center">
                  {join(targetWordData?.translation, ", ")}
                  {targetWordData?.partOfSpeech && targetWordData?.translation && <Separator className="mx-2 bg-slate-500/60" orientation="vertical" />}

                  <span>{targetWordData?.partOfSpeech}</span>
                </div>

                {targetWordData?.examples && targetWordData.examples.length > 0 && <h4 className="mt-8 mb-1 font-semibold">Examples</h4>}

                {map(targetWordData?.examples, (item) => (
                  <ul className="mb-3 px-4 text-gray-800 list-disc" key={item.id}>
                    <li>
                      <p className="leading-snug">{item.source}</p>
                      <p className="leading-snug">{item.target}</p>
                    </li>
                  </ul>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Entry;
