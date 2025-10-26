import { ipcMain } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { AudioFormat } from '../../types'

// FFmpeg initialization and configuration
let ffmpegPath: string | null = null
let ffmpeg: any = null

export function initializeFFmpeg(): { ffmpeg: any; ffmpegPath: string | null } {
  if (ffmpeg) {
    return { ffmpeg, ffmpegPath }
  }

  try {
    ffmpeg = require('fluent-ffmpeg')
    
    // Try to set FFmpeg path
    try {
      const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg')
      ffmpegPath = ffmpegInstaller.path
      ffmpeg.setFfmpegPath(ffmpegPath)
      console.log('Using FFmpeg from installer:', ffmpegPath)
    } catch (error) {
      console.warn('FFmpeg installer not available, trying system FFmpeg')
      
      // Try common FFmpeg paths
      const commonPaths = [
        '/opt/homebrew/bin/ffmpeg',  // Homebrew on Apple Silicon
        '/usr/local/bin/ffmpeg',     // Homebrew on Intel Mac
        '/usr/bin/ffmpeg',           // System installation
        'ffmpeg'                     // In PATH
      ]
      
      for (const path of commonPaths) {
        try {
          ffmpeg.setFfmpegPath(path)
          ffmpegPath = path
          console.log('Using FFmpeg from:', path)
          break
        } catch (pathError) {
          console.warn(`FFmpeg not found at ${path}`)
        }
      }
      
      if (!ffmpegPath) {
        console.error('FFmpeg not found in any common locations')
      }
    }
  } catch (error) {
    console.error('Failed to load fluent-ffmpeg:', error)
    ffmpeg = null
    ffmpegPath = null
  }

  return { ffmpeg, ffmpegPath }
}


// Store active file streams for real-time recording
const activeStreams = new Map<string, { stream: fs.WriteStream; format: AudioFormat; tempFilePath: string }>()

export function setupRecordingStreamHandlers() {
  // Start a new recording session with streaming
  ipcMain.handle('start-recording-stream', async (event, format: AudioFormat = 'webm') => {
    try {
      const recordingsPath = path.join(os.homedir(), 'Desktop')
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(recordingsPath)) {
        fs.mkdirSync(recordingsPath, { recursive: true })
      }
      
      // Generate filename with timestamp
      const now = new Date()
      const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5)
      const filename = `recording-${timestamp}.webm` // Always record as webm first
      const filePath = path.join(recordingsPath, filename)
      
      // Create write stream
      const writeStream = fs.createWriteStream(filePath)
      const sessionId = `recording-${Date.now()}`
      
      // Store the stream with format info
      activeStreams.set(sessionId, { stream: writeStream, format, tempFilePath: filePath })
      
      console.log(`Started streaming recording to: ${filePath} (target format: ${format})`)
      return { success: true, sessionId, filePath }
    } catch (error) {
      console.error('Error starting recording stream:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  // Write a chunk to the active stream
  ipcMain.handle('write-recording-chunk', async (event, sessionId: string, chunk: Uint8Array) => {
    try {
      const streamData = activeStreams.get(sessionId)
      if (!streamData) {
        return { success: false, error: 'Recording session not found' }
      }
      
      streamData.stream.write(Buffer.from(chunk))
      return { success: true }
    } catch (error) {
      console.error('Error writing recording chunk:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  // Finish the recording session
  ipcMain.handle('finish-recording-stream', async (event, sessionId: string) => {
    try {
      const streamData = activeStreams.get(sessionId)
      if (!streamData) {
        return { success: false, error: 'Recording session not found' }
      }
      
      // Close the stream
      streamData.stream.end()
      
      // If target format is MP3, convert the WebM file
      if (streamData.format === 'mp3') {
        const { ffmpeg: ffmpegInstance, ffmpegPath: currentFFmpegPath } = initializeFFmpeg()
        
        if (!ffmpegInstance || !currentFFmpegPath) {
          console.error('FFmpeg not available, cannot convert to MP3')
          console.log(`Keeping WebM file: ${streamData.tempFilePath}`)
        } else {
          const tempFilePath = streamData.tempFilePath
          const mp3FilePath = tempFilePath.replace('.webm', '.mp3')
          
          console.log(`Converting ${tempFilePath} to ${mp3FilePath}`)
          
          try {
            await new Promise<void>((resolve, reject) => {
              ffmpegInstance(tempFilePath)
                .toFormat('mp3')
                .audioBitrate('128k')
                .on('end', () => {
                  console.log('Conversion finished')
                  // Delete the temporary WebM file
                  try {
                    fs.unlinkSync(tempFilePath)
                  } catch (unlinkError) {
                    console.warn('Could not delete temporary file:', unlinkError)
                  }
                  resolve()
                })
                .on('error', (err: Error) => {
                  console.error('Conversion error:', err)
                  reject(err)
                })
                .save(mp3FilePath)
            })
            
            console.log(`Recording converted and saved to: ${mp3FilePath}`)
          } catch (conversionError) {
            console.error('FFmpeg conversion failed:', conversionError)
            // Keep the WebM file if conversion fails
            console.log(`Conversion failed, keeping WebM file: ${tempFilePath}`)
          }
        }
      } else {
        console.log(`Recording saved to: ${streamData.tempFilePath}`)
      }
      
      activeStreams.delete(sessionId)
      
      console.log(`Finished streaming recording session: ${sessionId}`)
      return { success: true }
    } catch (error) {
      console.error('Error finishing recording stream:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })
}

