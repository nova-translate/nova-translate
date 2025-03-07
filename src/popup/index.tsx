import "@/styles/globals.css";

import { useStorage } from "@plasmohq/storage/hook";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { StorageKeys } from "@/config/storage";
import { useEffect, useState } from "react";
import { Eye, EyeClosed } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DEFAULT_SHORTCUT } from "@/config/common";

function IndexPopup() {
  const [apiKey, setApiKey] = useStorage<string>(StorageKeys.API_KEY);
  const [apiUrl, setApiUrl] = useStorage<string>(StorageKeys.API_URL);
  const [modelId, setModelId] = useStorage<string>(StorageKeys.MODEL_ID);
  const [shortcut, setShortcut] = useStorage<string>(StorageKeys.SHORTCUT, DEFAULT_SHORTCUT);
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);

  const handleApiKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setApiKey(value);
  };

  const handleApiUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setApiUrl(value);
  };

  const handleModelIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setModelId(value);
  };

  const handleApiKeyEyeClick = () => {
    setIsApiKeyVisible((prev) => !prev);
  };

  const ApiKeyEyeIcon = isApiKeyVisible ? <Eye size={16} onClick={handleApiKeyEyeClick} /> : <EyeClosed size={16} onClick={handleApiKeyEyeClick} />;

  return (
    <div className="w-[450px] space-y-4 p-4">
      <AnimatePresence>
        <motion.div
          className="rounded-md border px-3 py-2 shadow-md"
          initial={{ opacity: 0, transform: "translateY(10px)" }}
          whileInView={{ opacity: 1, transform: "translateY(0)" }}
        >
          <h4 className="my-2 font-medium">{chrome.i18n.getMessage("setting_basic_title")}</h4>
          <Separator className="my-2 bg-slate-300/70 dark:bg-slate-200/70" />
          <div className="mb-2 flex items-center justify-between">
            <Label className="mr-2 min-w-20 flex-shrink-0">{chrome.i18n.getMessage("setting_basic_shortcut")}</Label>
            <Select value={shortcut} onValueChange={setShortcut}>
              <SelectTrigger className="h-7 w-36 text-sm">
                <SelectValue placeholder="Select a shortcut" />
              </SelectTrigger>
              <SelectContent className="w-36 text-sm">
                <SelectGroup>
                  <SelectItem value="ctrl+alt+n">Ctrl + Alt + N</SelectItem>
                  <SelectItem value="ctrl+alt+t">Ctrl + Alt + T</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        <motion.div
          className="rounded-md border px-3 py-2 shadow-md"
          initial={{ opacity: 0, transform: "translateY(10px)" }}
          whileInView={{ opacity: 1, transform: "translateY(0)" }}
        >
          <h4 className="my-2 font-medium">{chrome.i18n.getMessage("setting_model_title")}</h4>
          <Separator className="my-2 bg-slate-300/70 dark:bg-slate-200/70" />
          <div className="mb-2 flex items-center justify-between">
            <Label className="mr-2 min-w-20 flex-shrink-0">{chrome.i18n.getMessage("setting_model_id")}</Label>
            <Input className="h-7 text-sm" value={modelId} onChange={handleModelIdChange} />
          </div>
          <Separator className="my-2 bg-slate-300/70 dark:bg-slate-200/70" />
          <div className="mb-2 flex items-center">
            <Label className="mr-2 min-w-20 flex-shrink-0">{chrome.i18n.getMessage("setting_model_api_key")}</Label>
            <Input className="h-7 pr-10 text-sm" type={isApiKeyVisible ? "text" : "password"} value={apiKey} onChange={handleApiKeyChange} endIcon={ApiKeyEyeIcon} />
          </div>
          <Separator className="my-2 bg-slate-300/70 dark:bg-slate-200/70" />
          <div className="mb-2 flex items-center">
            <Label className="mr-2 min-w-20 flex-shrink-0">{chrome.i18n.getMessage("setting_model_api_url")}</Label>
            <Input className="h-7 text-sm" value={apiUrl} onChange={handleApiUrlChange} />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default IndexPopup;
