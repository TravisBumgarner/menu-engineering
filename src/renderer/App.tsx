/// <reference types="./preload.d.ts" />
import { MemoryRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { CHANNEL } from "../shared/types";

function App() {
  const [response, setResponse] = useState<string>("");

  useEffect(() => {
    window.electron?.ipcRenderer.on(CHANNEL.WEE_WOO, (arg) => {
      setResponse(JSON.stringify(arg));
    });

    window.electron?.ipcRenderer.on(CHANNEL.DEBUG_MESSAGE, (params) => {
      console.log(params);
    });
  }, []);

  const handlePing = () => {
    window.electron?.ipcRenderer.invoke(CHANNEL.GET_STATUS, {
      query: "example",
    });
  };

  const handleGetStatus = async () => {
    const result = await window.electron?.ipcRenderer.invoke(
      CHANNEL.GET_STATUS,
      {
        query: "example",
      }
    );
    setResponse(JSON.stringify(result));
  };

  return (
    <div>
      <button onClick={handlePing}>Ping</button>
      <button onClick={handleGetStatus}>Get Status!</button>
      {response && <div>Response: {response}</div>}
      <p>Sure hope everything works with auto updating</p>
    </div>
  );
}

export default function AppWrapper() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
      </Routes>
    </Router>
  );
}
