import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import fs from 'fs'
import path from 'path'

// Custom APIs for renderer
const api = {
  fs, // Exposing fs module
  path // Exposing path module
}

// Expose APIs to the renderer process
if (process.contextIsolation) {
  try {
    // Exposing the APIs safely with contextIsolation enabled
    contextBridge.exposeInMainWorld('electron', electronAPI) // Expose electronAPI (from @electron-toolkit)
    contextBridge.exposeInMainWorld('api', api) // Expose custom API (fs, path)
  } catch (error) {
    console.error('Error exposing APIs:', error)
  }
} else {
  // Fallback if context isolation is not enabled
  window.electron = electronAPI
  window.api = api
}
