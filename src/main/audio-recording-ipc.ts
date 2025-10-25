import { ipcMain } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

// Store active file streams for real-time recording
const activeStreams = new Map<string, fs.WriteStream>()

// Audio recording IPC handlers
export function setupAudioRecordingHandlers() {
  ipcMain.handle('get-recordings-path', () => {
    const recordingsPath = path.join(os.homedir(), 'Desktop')
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(recordingsPath)) {
      fs.mkdirSync(recordingsPath, { recursive: true })
    }
    
    return recordingsPath
  })

  // Start a new recording session with streaming
  ipcMain.handle('start-recording-stream', async () => {
    try {
      const recordingsPath = path.join(os.homedir(), 'Desktop')
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(recordingsPath)) {
        fs.mkdirSync(recordingsPath, { recursive: true })
      }
      
      // Generate filename with timestamp
      const now = new Date()
      const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5)
      const filename = `recording-${timestamp}.webm`
      const filePath = path.join(recordingsPath, filename)
      
      // Create write stream
      const writeStream = fs.createWriteStream(filePath)
      const sessionId = `recording-${Date.now()}`
      
      // Store the stream
      activeStreams.set(sessionId, writeStream)
      
      console.log(`Started streaming recording to: ${filePath}`)
      return { success: true, sessionId, filePath }
    } catch (error) {
      console.error('Error starting recording stream:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  // Write a chunk to the active stream
  ipcMain.handle('write-recording-chunk', async (event, sessionId: string, chunk: Uint8Array) => {
    try {
      const writeStream = activeStreams.get(sessionId)
      if (!writeStream) {
        return { success: false, error: 'Recording session not found' }
      }
      
      writeStream.write(Buffer.from(chunk))
      return { success: true }
    } catch (error) {
      console.error('Error writing recording chunk:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  // Finish the recording session
  ipcMain.handle('finish-recording-stream', async (event, sessionId: string) => {
    try {
      const writeStream = activeStreams.get(sessionId)
      if (!writeStream) {
        return { success: false, error: 'Recording session not found' }
      }
      
      // Close the stream
      writeStream.end()
      activeStreams.delete(sessionId)
      
      console.log(`Finished streaming recording session: ${sessionId}`)
      return { success: true }
    } catch (error) {
      console.error('Error finishing recording stream:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  // Legacy handler for backward compatibility
  ipcMain.handle('save-recording', async (event, audioBuffer: Uint8Array) => {
    try {
      const recordingsPath = path.join(os.homedir(), 'Desktop')
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(recordingsPath)) {
        fs.mkdirSync(recordingsPath, { recursive: true })
      }
      
      // Generate filename with timestamp
      const now = new Date()
      const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5)
      const filename = `recording-${timestamp}.webm`
      const filePath = path.join(recordingsPath, filename)
      
      // Write audio buffer to file
      fs.writeFileSync(filePath, Buffer.from(audioBuffer))
      
      console.log(`Recording saved to: ${filePath}`)
      return { success: true, filePath }
    } catch (error) {
      console.error('Error saving recording:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })
}
