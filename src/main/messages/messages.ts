import { typedIpcMain } from "./index";
import { CHANNEL } from "../../shared/types";
import queries from "../database/queries";

typedIpcMain.handle(CHANNEL.DB.ADD_USER, async (_event, params) => {
  const result = await queries.addUser(params.payload);
  return {
    type: "add_user",
    success: !!result,
  };
});

typedIpcMain.handle(CHANNEL.DB.GET_USERS, async () => {
  return {
    type: "get_users",
    users: await queries.getUsers(),
  };
});

typedIpcMain.on(CHANNEL.WEE_WOO, (event, params) => {
  event.reply(CHANNEL.WEE_WOO, { id: params.id, ok: true });
});
