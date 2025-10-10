import log from "electron-log/renderer";

export const logMessage = (message: string) => {
  if (import.meta.env.VITE_API_URL) {
    console.log(message);
  } else {
    log.info(message);
  }
};
