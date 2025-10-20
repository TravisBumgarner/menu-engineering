import { useEffect } from "react";
import { Route, MemoryRouter as Router, Routes } from "react-router-dom";
import type { ElectronHandler } from "../main/preload";
import { CHANNEL } from "../shared/messages.types";
import { RECIPE_STATUS } from "../shared/types";

declare global {
  interface Window {
    electron: ElectronHandler;
  }
}

function App() {
  useEffect(() => {
    window.electron.ipcRenderer.invoke(CHANNEL.DB.GET_RECIPES);
  });

  const handleAddRecipe = async () => {
    const response = await window.electron.ipcRenderer.invoke(
      CHANNEL.DB.ADD_RECIPE,
      {
        payload: {
          title: "New Recipe",
          produces: 4,
          units: "servings",
          status: RECIPE_STATUS.DRAFT,
          notes: "",
          showInMenu: true,
        },
      }
    );
    alert(response.success);
  };

  return (
    <div>
      <button onClick={handleAddRecipe}>Add Recipe</button>
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
