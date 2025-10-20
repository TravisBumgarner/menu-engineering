import { CHANNEL } from "../../shared/messages.types";
import queries from "../database/queries";
import { typedIpcMain } from "./index";

typedIpcMain.handle(CHANNEL.DB.ADD_RECIPE, async (_event, params) => {
  const result = await queries.addRecipe(params.payload);
  return {
    type: "add_recipe",
    success: !!result,
  };
});

typedIpcMain.handle(CHANNEL.DB.GET_RECIPES, async () => {
  return {
    type: "get_recipes",
    recipes: await queries.getRecipes(),
  };
});
