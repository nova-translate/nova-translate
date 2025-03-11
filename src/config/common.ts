export const MAX_TRANSLATION_LENGTH = 2000;
export const PLASMO_CONTAINER_Z_INDEX = 2147483647;
export const DEFAULT_SHORTCUT = "ctrl+alt+n";

export enum LanguageEnum {
  Chinese = "zh",
  Chinese_Simplified = "zh-CN",
  English = "en",
  Russian = "ru",
  Japanese = "ja",
  Korean = "ko"
}

export const Languages = [
  { value: LanguageEnum.Chinese_Simplified, label: chrome.i18n.getMessage("entry_panel_target_language_chinese_simplified") },
  { value: LanguageEnum.English, label: chrome.i18n.getMessage("entry_panel_target_language_english") },
  { value: LanguageEnum.Japanese, label: chrome.i18n.getMessage("entry_panel_target_language_japanese") },
  { value: LanguageEnum.Korean, label: chrome.i18n.getMessage("entry_panel_target_language_korean") },
  { value: LanguageEnum.Russian, label: chrome.i18n.getMessage("entry_panel_target_language_russian") }
];

export enum TextTypes {
  SINGLE_WORD = "SINGLE_WORD",
  LONG_TEXT = "LONG_TEXT"
}
