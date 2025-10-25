import { useState, useEffect } from 'react'
import { FolderOpen } from 'lucide-react'

import Layout from '@/components/Layout'
import { Recording } from '@/types'

export default function History() {
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadRecordings = async () => {
    try {
      const result = await window.electron.ipcRenderer.invoke('list-recordings')
      if (result.success) {
        setRecordings(result.recordings)
        setError(null)
      } else {
        setError(result.error || 'Failed to load recordings')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recordings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRecordings()

    const interval = setInterval(() => {
      loadRecordings()
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const handleShowInFolder = async (filepath: string) => {
    try {
      await window.electron.ipcRenderer.invoke('show-item-in-folder', filepath)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error showing item in folder:', err)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (isoString: string): string => {
    const date = new Date(isoString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center w-full">
        <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-700 max-w-6xl w-full">
          <h2 className="text-2xl font-bold text-white mb-6">
            Recording History
          </h2>

          {loading && (
            <div className="text-center text-gray-400 py-8">
              Loading recordings...
            </div>
          )}

          {error && (
            <div className="text-center text-red-400 py-8">Error: {error}</div>
          )}

          {!loading && !error && recordings.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              No recordings found. Start recording to see your files here!
            </div>
          )}

          {!loading && !error && recordings.length > 0 && (
            <div className="overflow-x-auto max-h-[320px] overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-gray-800 z-10">
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-300 font-semibold">
                      Filename
                    </th>
                    <th className="text-left py-3 px-4 text-gray-300 font-semibold">
                      Date Created
                    </th>
                    <th className="text-left py-3 px-4 text-gray-300 font-semibold">
                      Size
                    </th>
                    <th className="text-center py-3 px-4 text-gray-300 font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recordings.map((recording) => (
                    <tr
                      key={recording.filepath}
                      className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors"
                    >
                      <td className="py-4 px-4 text-white font-mono text-sm">
                        {recording.filename}
                      </td>
                      <td className="py-4 px-4 text-gray-300">
                        {formatDate(recording.createdAt)}
                      </td>
                      <td className="py-4 px-4 text-gray-300">
                        {formatFileSize(recording.size)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleShowInFolder(recording.filepath)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                        >
                          <FolderOpen size={16} />
                          Show
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-6 text-center text-gray-400 text-sm">
            Auto-refreshing every 3 seconds • Total: {recordings.length}{' '}
            {recordings.length === 1 ? 'recording' : 'recordings'}
          </div>
        </div>
      </div>
    </Layout>
  )
}
