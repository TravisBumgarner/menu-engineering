export const CHANNEL = {
  WEE_WOO: "wee_woo",
  GET_STATUS: "get_status",
  DEBUG_MESSAGE: "debug_message",
  DB: {
    ADD_USER: "DB_ADD_USER",
    GET_USERS: "DB_GET_USERS",
  },
} as const;

export type FromRenderer = {
  [CHANNEL.WEE_WOO]: { id: number };
  [CHANNEL.GET_STATUS]: { query: string };
};

export type FromMain = {
  [CHANNEL.WEE_WOO]: { ok: boolean; id: number };
  [CHANNEL.DEBUG_MESSAGE]: {
    message: string;
    level: "info" | "warn" | "error" | "log";
  };
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
