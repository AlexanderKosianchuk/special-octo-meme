import { ElectronHandler } from '../main/preload'

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    electron: ElectronHandler & {
      ipcRenderer: {
        invoke: (channel: 'save-recording' | 'get-recordings-path', ...args: any[]) => Promise<any>
      }
    }
  }
}

export {}
