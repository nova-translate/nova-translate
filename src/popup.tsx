import { Input, NextUIProvider } from "@nextui-org/react";

import "./style.css";

import { useAtom } from "jotai";

import { settingAtom } from "~atoms/settingAtom";

function IndexPopup() {
  const [settings, setSettings] = useAtom(settingAtom);

  const handleValueChange = (value: string) => {
    if (!value) return;
    setSettings({ ...settings, apiKey: value });
  };

  return (
    <NextUIProvider>
      <div className="w-[300px] rounded p-4">
        <Input
          isClearable
          isRequired
          type="apiKey"
          label="ApiKey"
          onValueChange={handleValueChange}
        />
      </div>
    </NextUIProvider>
  );
}

export default IndexPopup;
