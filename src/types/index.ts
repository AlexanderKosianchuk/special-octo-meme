// Audio format types
export type AudioFormat = 'webm' | 'mp3'

// IPC Channel types
export type Channels = 'get-recordings-path'

export type InvokeChannels = 
  | 'get-recordings-path'
  | 'start-recording-stream'
  | 'write-recording-chunk'
  | 'finish-recording-stream'
  | 'list-recordings'
  | 'show-item-in-folder'
  | 'set-audio-format'
  | 'get-audio-format'

// Recording related types
export interface Recording {
  filename: string
  filepath: string
  size: number
  createdAt: string
  modifiedAt: string
}

// IPC Response types
export interface IpcResponse<T = any> {
  success: boolean
  error?: string
  data?: T
}

export interface RecordingSessionResponse extends IpcResponse {
  sessionId?: string
  filePath?: string
}

export interface RecordingsListResponse extends IpcResponse {
  recordings?: Recording[]
}

export interface AudioFormatResponse extends IpcResponse {
  audioFormat?: AudioFormat
}

// Component prop types
export interface AudioFormatSelectorProps {
  audioFormat: AudioFormat
  setAudioFormat: (format: AudioFormat) => void
  isRunning: boolean
}

export interface HelpTextProps {
  audioFormat: AudioFormat
}

export interface ControlButtonsProps {
  isRunning: boolean
  isPaused: boolean
  onStart: () => void
  onStop: () => void
  onPauseResume: () => void
  size?: 'small' | 'normal'
}

export interface RecordingDurationProps {
  duration: number
}

export interface StatusIndicatorProps {
  isRunning: boolean
  isPaused: boolean
}

export interface LayoutProps {
  children: React.ReactNode
}

// Electron handler types
export interface ElectronIpcRenderer {
  sendMessage(channel: Channels, ...args: unknown[]): void
  on(channel: Channels, func: (...args: unknown[]) => void): () => void
  once(channel: Channels, func: (...args: unknown[]) => void): void
  invoke(channel: InvokeChannels, ...args: unknown[]): Promise<any>
}

export interface ElectronHandler {
  ipcRenderer: ElectronIpcRenderer
}

// Global window interface extension
declare global {
  interface Window {
    electron: ElectronHandler
  }
}
