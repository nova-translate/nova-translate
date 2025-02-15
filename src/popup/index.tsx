import "@/styles/globals.css";

import { IconEye, IconEyeClosed } from "@tabler/icons-react";
import { useStorage } from "@plasmohq/storage/hook";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { StorageKeys } from "@/config/storage";

function IndexPopup() {
  const [apiKey, setApiKey] = useStorage(StorageKeys.API_KEY);
  const [apiUrl, setApiUrl] = useStorage(StorageKeys.API_URL);
  const [modelId, setModelId] = useStorage(StorageKeys.MODEL_ID);

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

  return (
    <div className="w-[450px] p-4">
      <Label htmlFor="apiKey" className="flex items-center">
        API Key
      </Label>
      <Input id="apiKey" className="mb-3" placeholder="请输入" value={apiKey} onChange={handleApiKeyChange} />

      <Label htmlFor="apiUrl" className="flex items-center">
        API URL
      </Label>
      <Input id="apiUrl" className="mb-3" placeholder="请输入" value={apiUrl} onChange={handleApiUrlChange} />

      <Label htmlFor="modeId" className="flex items-center">
        Model ID
      </Label>
      <Input id="modeId" className="mb-3" placeholder="请输入" value={modelId} onChange={handleModelIdChange} />
    </div>
  );
}

export default IndexPopup;
