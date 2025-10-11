export const CHANNEL = {
  DB: {
    ADD_USER: "DB_ADD_USER",
    GET_USERS: "DB_GET_USERS",
  },
} as const;

export type FromRenderer = {
  // [CHANNEL.WEE_WOO]: { id: number };
};

export type FromMain = {
  // [CHANNEL.WEE_WOO]: { ok: boolean; id: number };
};

export type Invokes = {
  [CHANNEL.DB.ADD_USER]: {
    args: { payload: { name: string } };
    result: { success: boolean };
  };
  [CHANNEL.DB.GET_USERS]: {
    args: undefined;
    result: { users: Array<{ id: number; name: string }> };
  };
};
