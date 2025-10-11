import { MemoryRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { CHANNEL } from "../shared/types";
import type { ElectronHandler } from "../main/preload";

declare global {
  interface Window {
    electron: ElectronHandler;
  }
}

function App() {
  useEffect(() => {
    window.electron.ipcRenderer.invoke(CHANNEL.DB.GET_USERS);
  });

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
