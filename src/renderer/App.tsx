import { MemoryRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";

function App() {
  const [response, setResponse] = useState<string>("");

  useEffect(() => {
    // Listen for the response
    window.electron?.ipcRenderer.on("ipc-example", (arg: unknown) => {
      console.log("Received response:", arg);
      setResponse(JSON.stringify(arg));
    });
  }, []);

  const handlePing = () => {
    window.electron?.ipcRenderer.sendMessage("ipc-example", "ping");
  };

  return (
    <div>
      <button onClick={handlePing}>Ping</button>
      {response && <div>Response: {response}</div>}
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
