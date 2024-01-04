import { Button, Input, NextUIProvider } from "@nextui-org/react";
import { useState } from "react";

import "./style.css";

function IndexPopup() {
  const [data, setData] = useState("");

  return (
    <NextUIProvider>
      <div className="w-[300px] rounded p-4">
        <Input isRequired type="apiKey" label="ApiKey" size="sm" />
      </div>
    </NextUIProvider>
  );
}

export default IndexPopup;
