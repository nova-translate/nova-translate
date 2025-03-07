import { LanguageEnum, TextTypes } from "@/config/common";
import { clsx, type ClassValue } from "clsx";
import { get, split } from "lodash-es";
import { twMerge } from "tailwind-merge";
import TinySegmenter from "tiny-segmenter";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

let segmenter: TinySegmenter;

export async function checkTextType(text: string) {
  if (!text) return TextTypes.LONG_TEXT;
  const result = await chrome.i18n.detectLanguage(text);
  const firstLanguage = get(result, ["languages", 0, "language"], "");

  if (!firstLanguage) return TextTypes.LONG_TEXT;

  // use space to detect if the text is a single word
  if (firstLanguage.startsWith(LanguageEnum.English) || firstLanguage === LanguageEnum.Russian) {
    return split(text, " ").length > 1 ? TextTypes.LONG_TEXT : TextTypes.SINGLE_WORD;
  }

  // use character length to detect if the text is a single word
  if (firstLanguage.startsWith(LanguageEnum.Chinese) || [LanguageEnum.Korean].includes(firstLanguage as LanguageEnum)) {
    return text.length >= 3 ? TextTypes.LONG_TEXT : TextTypes.SINGLE_WORD;
  }

  // use tiny-segmenter to detect if the text is a single word
  if (firstLanguage === LanguageEnum.Japanese) {
    if (!segmenter) segmenter = new TinySegmenter();
    const segments = segmenter.segment(text);
    return segments.length > 1 ? TextTypes.LONG_TEXT : TextTypes.SINGLE_WORD;
  }

  return TextTypes.LONG_TEXT;
}
