import "@/styles/globals.css";

import { useStorage } from "@plasmohq/storage/hook";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { StorageKeys } from "@/config/storage";
import { useState } from "react";
import { Eye, EyeClosed } from "lucide-react";

function IndexPopup() {
  const [apiKey, setApiKey] = useStorage(StorageKeys.API_KEY);
  const [apiUrl, setApiUrl] = useStorage(StorageKeys.API_URL);
  const [modelId, setModelId] = useStorage(StorageKeys.MODEL_ID);
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

  const ApiKeyEyeIcon = isApiKeyVisible ? <Eye size={18} onClick={handleApiKeyEyeClick} /> : <EyeClosed size={18} onClick={handleApiKeyEyeClick} />;

  return (
    <div className="w-[450px] p-4">
      <Label htmlFor="apiKey" className="flex items-center">
        API Key
      </Label>
      <Input
        id="apiKey"
        className="mb-3 text-sm"
        placeholder="请输入"
        type={isApiKeyVisible ? "text" : "password"}
        value={apiKey}
        onChange={handleApiKeyChange}
        endIcon={ApiKeyEyeIcon}
      />

      <Label htmlFor="apiUrl" className="flex items-center">
        API URL
      </Label>
      <Input id="apiUrl" className="mb-3 text-sm" placeholder="请输入" value={apiUrl} onChange={handleApiUrlChange} />

      <Label htmlFor="modeId" className="flex items-center">
        Model ID
      </Label>
      <Input id="modeId" className="mb-3 text-sm" placeholder="请输入" value={modelId} onChange={handleModelIdChange} />
    </div>
  );
}

export default IndexPopup;
