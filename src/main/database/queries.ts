import { users } from "./schema";
import { db } from "./client";

const addUser = async (params: { name: string }) => {
  const id = await db.insert(users).values(params).run();
  return id;
};

const getUsers = async () => {
  return await db.select().from(users).all();
};

export default {
  addUser,
  getUsers,
};
