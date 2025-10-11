import { MemoryRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { CHANNEL } from "../shared/types";
import type { ElectronHandler } from "../main/preload";

declare global {
  interface Window {
    electron: ElectronHandler;
  }
}

function App() {
  const [response, setResponse] = useState<string>("");

  useEffect(() => {
    window.electron.ipcRenderer.invoke(CHANNEL.DB.GET_USERS);
  });

  useEffect(() => {
    window.electron?.ipcRenderer.on(CHANNEL.WEE_WOO, (arg) => {
      setResponse(JSON.stringify(arg));
    });

    window.electron?.ipcRenderer.on(CHANNEL.DEBUG_MESSAGE, (params) => {
      console.log(params);
    });
  }, []);

  const handleAddUser = async () => {
    const response = await window.electron.ipcRenderer.invoke(
      CHANNEL.DB.ADD_USER,
      {
        payload: { name: "Travis" },
      }
    );
    alert(response.success);
  };

  return (
    <div>
      <button onClick={handleAddUser}>Add User</button>
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
