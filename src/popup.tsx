import { Input, NextUIProvider } from "@nextui-org/react";
import { IconEye, IconEyeClosed } from "@tabler/icons-react";
import { useState } from "react";

import { useStorage } from "@plasmohq/storage/hook";

import { StorageKeys } from "~config/storage";

import "./style.css";

function IndexPopup() {
  const [apiKey, setApiKey] = useStorage(StorageKeys.API_KEY);
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);

  const handleValueChange = (value: string) => {
    if (!value) return;
    setApiKey(value);
  };

  const handleApiKeyEyeClick = () => {
    setIsApiKeyVisible((prev) => !prev);
  };

  const ApiKeyEyeIcon = (
    <button className="focus:outline-none" type="button" onClick={handleApiKeyEyeClick}>
      {isApiKeyVisible ? <IconEyeClosed size={20} /> : <IconEye size={20} />}
    </button>
  );

  return (
    <NextUIProvider>
      <div className="w-[450px] rounded p-4">
        <Input isRequired label="ApiKey" value={apiKey} onValueChange={handleValueChange} endContent={ApiKeyEyeIcon} type={isApiKeyVisible ? "text" : "password"} />
      </div>
    </NextUIProvider>
  );
}

export default IndexPopup;
