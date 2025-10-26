import { ipcMain, app } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { AudioFormat } from '../../types'

// Configuration constants
const CONFIG_PATH = path.join(app.getPath('userData'), 'config.json')

export function setupStoreHandlers() {
  // Store audio format preference
  ipcMain.handle('set-audio-format', (event, format: AudioFormat) => {
    try {
      let config = {}
      
      // Load existing config if it exists
      if (fs.existsSync(CONFIG_PATH)) {
        const configData = fs.readFileSync(CONFIG_PATH, 'utf8')
        config = JSON.parse(configData)
      }
      
      // Update audio format preference
      config = { ...config, audioFormat: format }
      
      // Save config
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2))
      
      return { success: true }
    } catch (error) {
      console.error('Error saving audio format preference:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  // Get audio format preference
  ipcMain.handle('get-audio-format', () => {
    try {
      if (!fs.existsSync(CONFIG_PATH)) {
        return { success: true, audioFormat: 'webm' } // Default format
      }
      
      const configData = fs.readFileSync(CONFIG_PATH, 'utf8')
      const config = JSON.parse(configData)
      
      const audioFormat = config.audioFormat || 'webm'
      
      return { success: true, audioFormat }
    } catch (error) {
      console.error('Error loading audio format preference:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error', audioFormat: 'webm' }
    }
  })

  // Get recordings path
  ipcMain.handle('get-recordings-path', () => {
    const recordingsPath = path.join(os.homedir(), 'Desktop')
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(recordingsPath)) {
      fs.mkdirSync(recordingsPath, { recursive: true })
    }
    
    return recordingsPath
  })
}

