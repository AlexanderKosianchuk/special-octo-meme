import { setupStoreHandlers } from './store-handlers'
import { setupRecordingStreamHandlers } from './recording-stream-handlers'
import { setupFileHandlers } from './file-handlers'

export function setupHandlers() {
  setupStoreHandlers()
  setupRecordingStreamHandlers()
  setupFileHandlers()
}

