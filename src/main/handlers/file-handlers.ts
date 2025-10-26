import { ipcMain, shell } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

export function setupFileHandlers() {
  // List all recordings
  ipcMain.handle('list-recordings', async () => {
    try {
      const recordingsPath = path.join(os.homedir(), 'Desktop')
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(recordingsPath)) {
        fs.mkdirSync(recordingsPath, { recursive: true })
        return { success: true, recordings: [] }
      }
      
      // Read directory contents
      const files = fs.readdirSync(recordingsPath)
      
      // Filter for audio files and get stats
      const recordings = files
        .filter(file => {
          const ext = path.extname(file).toLowerCase()
          return ext === '.webm' || ext === '.mp3'
        })
        .map(file => {
          const filePath = path.join(recordingsPath, file)
          const stats = fs.statSync(filePath)
          
          return {
            filename: file,
            filepath: filePath,
            size: stats.size,
            createdAt: stats.birthtime.toISOString(),
            modifiedAt: stats.mtime.toISOString(),
          }
        })
        .sort((a, b) => {
          // Sort by creation date, newest first
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
      
      return { success: true, recordings }
    } catch (error) {
      console.error('Error listing recordings:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error', recordings: [] }
    }
  })

  // Show item in folder
  ipcMain.handle('show-item-in-folder', async (event, filePath: string) => {
    try {
      shell.showItemInFolder(filePath)
      return { success: true }
    } catch (error) {
      console.error('Error showing item in folder:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })
}

