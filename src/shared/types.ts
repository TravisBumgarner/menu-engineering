export const CHANNEL = {
  WEE_WOO: "wee_woo",
  GET_STATUS: "get_status",
  DEBUG_MESSAGE: "debug_message",
} as const;

export type FromRenderer = {
  [CHANNEL.WEE_WOO]: { id: number }; // fire-and-forget
  [CHANNEL.GET_STATUS]: { query: string }; // could be used with invoke
};

export type FromMain = {
  [CHANNEL.WEE_WOO]: { ok: boolean; id: number };
  [CHANNEL.DEBUG_MESSAGE]: {
    message: string;
    level: "info" | "warn" | "error" | "log";
  };
};

export type Invokes = {
  [CHANNEL.GET_STATUS]: {
    args: { query: string };
    result: { status: string };
  };
};
