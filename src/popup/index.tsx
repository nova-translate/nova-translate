import "@/styles/globals.css";

import { useStorage } from "@plasmohq/storage/hook";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { StorageKeys } from "@/config/storage";
import { useState } from "react";
import { Eye, EyeClosed } from "lucide-react";
import { Switch } from "@/components/ui/switch";

function IndexPopup() {
  const [apiKey, setApiKey] = useStorage<string>(StorageKeys.API_KEY);
  const [apiUrl, setApiUrl] = useStorage<string>(StorageKeys.API_URL);
  const [modelId, setModelId] = useStorage<string>(StorageKeys.MODEL_ID);
  const [learningModeState, setLearningModeState] = useStorage<boolean>(StorageKeys.LEARNING_MODE);
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

  const handleLearningModeChange = (value: boolean) => {
    setLearningModeState(value);
  };

  const handleApiKeyEyeClick = () => {
    setIsApiKeyVisible((prev) => !prev);
  };

  const ApiKeyEyeIcon = isApiKeyVisible ? <Eye size={18} onClick={handleApiKeyEyeClick} /> : <EyeClosed size={18} onClick={handleApiKeyEyeClick} />;

  return (
    <div className="w-[450px] p-4 space-y-4">
      <div className="border shadow-sm rounded-md px-3 py-2">
        <h4 className="text-base font-medium mb-3">General Configuration</h4>
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="apiKey" className="flex-shrink-0 min-w-20 mr-2">
            Learning Mode
          </Label>
          <Switch checked={learningModeState} onCheckedChange={handleLearningModeChange} />
        </div>
      </div>

      <div className="border shadow rounded px-3 py-2">
        <h4 className="text-base font-medium mb-3">Model Provider</h4>
        <div className="flex items-center mb-2">
          <Label htmlFor="modeId" className="flex-shrink-0 min-w-20 mr-2">
            Model ID
          </Label>
          <Input id="modeId" className="text-sm h-8" value={modelId} onChange={handleModelIdChange} />
        </div>

        <div className="flex items-center mb-2">
          <Label htmlFor="apiKey" className="flex-shrink-0 min-w-20 mr-2">
            API Key
          </Label>
          <Input
            id="apiKey"
            className="text-sm h-8"
            type={isApiKeyVisible ? "text" : "password"}
            value={apiKey}
            onChange={handleApiKeyChange}
            endIcon={ApiKeyEyeIcon}
          />
        </div>

        <div className="flex items-center mb-2">
          <Label htmlFor="apiUrl" className="flex-shrink-0 min-w-20 mr-2">
            API URL
          </Label>
          <Input id="apiUrl" className="text-sm h-8" value={apiUrl} onChange={handleApiUrlChange} />
        </div>
      </div>
    </div>
  );
}

export default IndexPopup;
