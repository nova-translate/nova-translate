import "@/styles/globals.css";

import { useStorage } from "@plasmohq/storage/hook";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { StorageKeys } from "@/config/storage";
import { useState } from "react";
import { CircleX, Eye, EyeClosed } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

function IndexPopup() {
  const [apiKey, setApiKey] = useStorage<string>(StorageKeys.API_KEY);
  const [apiUrl, setApiUrl] = useStorage<string>(StorageKeys.API_URL);
  const [modelId, setModelId] = useStorage<string>(StorageKeys.MODEL_ID);
  const [shortcut, setShortcut] = useStorage<string>(StorageKeys.SHORTCUT, "Alt+Shift+N");
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
    <div className="w-[450px] p-4 space-y-4">
      <AnimatePresence>
        <motion.div
          className="border shadow-lg rounded-md px-3 py-2"
          initial={{ opacity: 0, transform: "translateY(10px)" }}
          whileInView={{ opacity: 1, transform: "translateY(0)" }}
        >
          <h4 className="text-base font-medium mb-3">Basic Setting</h4>
          <Separator className="my-2 bg-slate-300/70 dark:bg-slate-200/70" />
          <div className="flex items-center mb-2 justify-between">
            <Label className="flex-shrink-0 min-w-20 mr-2">Keyboard shortcut</Label>
            <Select value={shortcut} onValueChange={setShortcut}>
              <SelectTrigger className="w-36 h-7 text-sm">
                <SelectValue placeholder="Select a shortcut" />
              </SelectTrigger>
              <SelectContent className="w-36 text-sm">
                <SelectGroup>
                  <SelectItem value="alt+p">Alt + P</SelectItem>
                  <SelectItem value="alt+shift+p">Alt + Shift + P</SelectItem>
                  <SelectItem value="ctrl+alt+p">Ctrl + Alt + P</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        <motion.div
          className="border shadow-lg rounded-md px-3 py-2"
          initial={{ opacity: 0, transform: "translateY(10px)" }}
          whileInView={{ opacity: 1, transform: "translateY(0)" }}
        >
          <h4 className="text-base font-medium">Model Provider</h4>
          <Separator className="my-2 bg-slate-300/70 dark:bg-slate-200/70" />
          <div className="flex items-center mb-2 justify-between">
            <Label className="flex-shrink-0 min-w-20 mr-2">Model ID</Label>
            <Input className="h-7 text-sm" value={modelId} onChange={handleModelIdChange} />
          </div>
          <Separator className="my-2 bg-slate-300/70 dark:bg-slate-200/70" />
          <div className="flex items-center mb-2">
            <Label className="flex-shrink-0 min-w-20 mr-2">API key</Label>
            <Input className="h-7 text-sm pr-10" type={isApiKeyVisible ? "text" : "password"} value={apiKey} onChange={handleApiKeyChange} endIcon={ApiKeyEyeIcon} />
          </div>
          <Separator className="my-2 bg-slate-300/70 dark:bg-slate-200/70" />
          <div className="flex items-center mb-2">
            <Label className="flex-shrink-0 min-w-20 mr-2">API URL</Label>
            <Input className="h-7 text-sm" value={apiUrl} onChange={handleApiUrlChange} />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default IndexPopup;
