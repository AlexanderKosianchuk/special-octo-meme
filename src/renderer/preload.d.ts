import { ElectronHandler } from '../main/preload'
import { AudioFormat } from '../main/audio-recording-ipc'

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    electron: ElectronHandler & {
      ipcRenderer: {
        invoke: (channel: 'get-recordings-path' | 'start-recording-stream' | 'write-recording-chunk' | 'finish-recording-stream' | 'list-recordings' | 'show-item-in-folder' | 'set-audio-format' | 'get-audio-format', ...args: any[]) => Promise<any>
      }
    }
  }
}

export {}
