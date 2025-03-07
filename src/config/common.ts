import { Space } from "lucide-react";

export const MAX_TRANSLATION_LENGTH = 2000;
export const PLASMO_CONTAINER_Z_INDEX = 2147483647;
export const DEFAULT_SHORTCUT = "alt+n";

export enum LanguageEnum {
  Chinese = "zh",
  English = "en",
  Russian = "ru",
  Japanese = "ja",
  Korean = "ko"
}

export const Languages = [
  { value: LanguageEnum.Chinese, label: "Chinese" },
  { value: LanguageEnum.English, label: "English" },
  { value: LanguageEnum.Russian, label: "Russian" },
  { value: LanguageEnum.Japanese, label: "Japanese" },
  { value: LanguageEnum.Korean, label: "Korean" }
];

export enum TextTypes {
  SINGLE_WORD = "SINGLE_WORD",
  LONG_TEXT = "LONG_TEXT"
}
