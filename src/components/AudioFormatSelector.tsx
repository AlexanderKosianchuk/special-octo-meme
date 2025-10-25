interface AudioFormatSelectorProps {
  audioFormat: 'webm' | 'mp3'
  setAudioFormat: (format: 'webm' | 'mp3') => void
  isRunning: boolean
}

export default function AudioFormatSelector({
  audioFormat,
  setAudioFormat,
  isRunning,
}: AudioFormatSelectorProps) {
  return (
    <div className="flex justify-center mb-8">
      <div className="bg-gray-800 rounded-xl px-6 py-4 border border-gray-600">
        <div className="text-center">
          <div className="text-sm text-gray-400 mb-3">Audio Format</div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setAudioFormat('webm')}
              disabled={isRunning}
              className={`
                px-6 py-2 rounded-lg transition-all duration-200 font-medium
                ${
                  audioFormat === 'webm'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }
                ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              WebM
            </button>
            <button
              type="button"
              onClick={() => setAudioFormat('mp3')}
              disabled={isRunning}
              className={`
                px-6 py-2 rounded-lg transition-all duration-200 font-medium
                ${
                  audioFormat === 'mp3'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }
                ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              MP3
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
