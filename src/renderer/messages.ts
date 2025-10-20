import { ElectronHandler } from "../main/preload";

declare global {
  interface Window {
    electron: ElectronHandler;
  }
}

// Cannot figure out why TypeScript is not picking up the global declaration above
// if I include it in a .d.ts file, therefore, this file.
export const send: typeof window.electron.ipcRenderer.send = (...args) => {
  return window.electron.ipcRenderer.send(...args);
};

export const invoke: typeof window.electron.ipcRenderer.invoke = (...args) => {
  return window.electron.ipcRenderer.invoke(...args);
};

export const on: typeof window.electron.ipcRenderer.on = (...args) => {
  return window.electron.ipcRenderer.on(...args);
};

export {};
