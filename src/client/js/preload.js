const { contextBridge, ipcRenderer } = require("electron");    

contextBridge.exposeInMainWorld("api", { ipcRenderer: { ...ipcRenderer, on: ipcRenderer.on } });