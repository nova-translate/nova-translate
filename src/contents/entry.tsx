import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useDragControls } from "motion/react";
import Mousetrap from "mousetrap";
import { debounce, split, uniqueId, map, join } from "lodash-es";
import { ArrowRight, Ban, Check, ChevronsUpDown, GripHorizontal, Pin, PinOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useStorage } from "@plasmohq/storage/hook";
import { usePort } from "@plasmohq/messaging/hook";
import { StorageKeys } from "@/config/storage";
import { MessageTypes } from "@/config/message";
import { checkTextType, cn } from "@/lib/utils";
import { DEFAULT_SHORTCUT, LanguageEnum, Languages, MAX_TRANSLATION_LENGTH, TextTypes } from "@/config/common";

import cssText from "data-text:@/styles/contents.css";
import type { SingleWordInfoType } from "@/background/ports/ai";
import { baseMotionProps } from "@/config/motion";
import { Toggle } from "@/components/ui/toggle";

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
  const [shortcut] = useStorage<string>(StorageKeys.SHORTCUT, DEFAULT_SHORTCUT);
  const [targetLanguage, setTargetLanguage] = useStorage(StorageKeys.TARGET_LANGUAGE, (value) => {
    if (value === undefined) return LanguageEnum.English;
    return value;
  });
  const [pinned, setPinned] = useState(false);

  const dragControls = useDragControls();

  function startDrag(event: React.PointerEvent) {
    event.preventDefault();
    dragControls.start(event, { snapToCursor: false });
  }

  // bottom middle of the selected text
  const entryPanelPosition = useMemo(() => {
    return {
      x: sourceTextRect.left + (sourceTextRect.right - sourceTextRect.left) / 2 - 200,
      y: sourceTextRect.bottom + 10
    };
  }, [sourceTextRect.left, sourceTextRect.right, sourceTextRect.bottom]);

  const getTranslatedText = async (selectedText: string, selectedTextContext: string) => {
    const id = uniqueId();
    const textType = await checkTextType(selectedText);

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
    if (language === targetLanguage) return;
    setTargetLanguage(language);
    getTranslatedText(sourceText, context);
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
      setSourceText(selectedText);
      getTranslatedText(selectedText, selectedTextContext);

      // if not show panel before or not pinned, reset position
      if (!pinned || !showEntryPanel) setSourceTextRect({ left, right, top, bottom });
    });

    return () => {
      Mousetrap.unbind(shortcut);
    };
  }, [shortcut, pinned, showEntryPanel]);

  // update entry panel position when scrolling the page
  useEffect(() => {
    const handleScroll = debounce(() => {
      if (!showEntryPanel) return;
      if (pinned) return;

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
  }, [showEntryPanel, pinned]);

  // hide entry panel when click outside
  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      // do not hide if click on the extension element
      const target = event.target as HTMLElement;
      if (target.localName === "plasmo-csui") return;
      if (pinned) return;

      setShowEntryPanel(false);
      setSourceTextRect({ left: 0, right: 0, top: 0, bottom: 0 });
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [pinned]);

  return (
    <>
      <AnimatePresence>
        {showEntryPanel && (
          <motion.div
            className="-translate-x-1/2 base-background base-border base-font fixed w-[400px] rounded-lg px-3 pt-4 pb-3 text-sm shadow-lg"
            initial={{ opacity: 0, x: entryPanelPosition.x, y: entryPanelPosition.y + 10 }}
            whileInView={{ opacity: 1, x: entryPanelPosition.x, y: entryPanelPosition.y }}
            exit={{ opacity: 0 }}
            drag
            dragListener={false}
            dragMomentum={false}
            dragControls={dragControls}
          >
            <div
              className="absolute top-0 right-0 left-0 mx-auto flex w-1/6 transform cursor-move justify-center text-slate-500/70 transition-colors hover:text-slate-950"
              onPointerDown={startDrag}
            >
              <GripHorizontal size={14} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center justify-between">
                <Button disabled variant="outline" size={"sm"} className={cn("w-36 justify-between", !targetLanguage && "text-muted-foreground")}>
                  <div className="overflow-hidden overflow-ellipsis text-left">{chrome.i18n.getMessage("entry_panel_source_language")}</div>
                  <ChevronsUpDown className="opacity-50" />
                </Button>

                <ArrowRight size={20} className="mx-2" />

                <Popover open={languageOptionsOpen} onOpenChange={setLanguageOptionsOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size={"sm"} className={cn("w-36 justify-between", !targetLanguage && "text-muted-foreground")}>
                      <div className="overflow-hidden overflow-ellipsis text-left">{Languages.find((language) => language.value === targetLanguage)?.label}</div>
                      <ChevronsUpDown className="opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-36 p-0">
                    <Command>
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
                              <div className="overflow-hidden overflow-ellipsis text-nowrap text-xs" title={language.label}>
                                {language.label}
                              </div>
                              <Check className={cn("ml-auto", language.value === targetLanguage ? "opacity-100" : "opacity-0")} />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Toggle size={"sm"} pressed={pinned} onPressedChange={setPinned}>
                  {pinned ? <Pin /> : <PinOff />}
                </Toggle>
              </div>
            </div>

            <Separator className="my-3 bg-slate-300/70 dark:bg-slate-200/70" />

            {errorMessage && (
              <div className="mb-2 flex items-center">
                <Ban size={14} className="mr-2 text-red-600" />
                <span className="text-red-600">{errorMessage}</span>
              </div>
            )}

            {textType === TextTypes.LONG_TEXT && !errorMessage && <div className="min-h-6">{targetText}</div>}
            {textType === TextTypes.SINGLE_WORD && !errorMessage && (
              <div className="min-h-6">
                <div className="mb-1 flex items-center">
                  {targetWordData && (
                    <motion.span {...baseMotionProps} className="mr-3 font-bold text-lg">
                      {sourceText}
                    </motion.span>
                  )}
                  {targetWordData?.pronunciation && (
                    <motion.span {...baseMotionProps} className="mr-2 text-gray-800">
                      [{targetWordData?.pronunciation}]
                    </motion.span>
                  )}
                </div>

                <div className="flex h-3 items-center text-gray-800">
                  {join(targetWordData?.translation, ", ")}
                  {targetWordData?.partOfSpeech && targetWordData?.translation && <Separator className="mx-2 bg-slate-500/60" orientation="vertical" />}
                  <motion.span {...baseMotionProps}>{targetWordData?.partOfSpeech}</motion.span>
                </div>

                {targetWordData?.examples && targetWordData.examples.length > 0 && (
                  <motion.h4 {...baseMotionProps} className="mt-8 mb-1 font-semibold">
                    {chrome.i18n.getMessage("entry_panel_content_title_examples")}
                  </motion.h4>
                )}

                {map(targetWordData?.examples, (item) => (
                  <motion.ul {...baseMotionProps} className="mb-3 list-disc px-4 text-gray-800" key={item.id}>
                    <li>
                      <p className="leading-snug">{item.source}</p>
                      <p className="leading-snug">{item.target}</p>
                    </li>
                  </motion.ul>
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
