import { useEffect } from "react";
import { CHANNEL } from "../shared/messages.types";
import { RECIPE_STATUS } from "../shared/types";
import Router from "./components/Router";
import { invoke } from "./messages";

function App() {
  useEffect(() => {
    invoke(CHANNEL.DB.GET_RECIPES);
  });

  const handleAddRecipe = async () => {
    const response = await invoke(CHANNEL.DB.ADD_RECIPE, {
      payload: {
        title: "New Recipe",
        produces: 4,
        units: "servings",
        status: RECIPE_STATUS.DRAFT,
        notes: "",
        showInMenu: true,
      },
    });
    alert(response.success);
  };

  return (
    <div>
      <button onClick={handleAddRecipe}>Add Recipe</button>
      <Router />
    </div>
  );
}

export default App;
