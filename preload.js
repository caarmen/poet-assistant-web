const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("desktop", { "desktop": true })