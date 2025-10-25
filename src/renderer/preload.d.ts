import { ElectronHandler } from '../main/preload'

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    electron: ElectronHandler & {
      ipcRenderer: {
        invoke: (channel: 'get-recordings-path' | 'start-recording-stream' | 'write-recording-chunk' | 'finish-recording-stream', ...args: any[]) => Promise<any>
      }
    }
  }
}

export {}
