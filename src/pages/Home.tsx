import { useState } from 'react'
import { Play, Square, Pause, Mic } from 'lucide-react'

export default function Home() {
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  const getStatusColor = () => {
    if (!isRunning) return 'bg-gray-500'
    if (isPaused) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getStatusText = () => {
    if (!isRunning) return 'Ready to record'
    if (isPaused) return 'Recording paused'
    return 'Recording...'
  }

  const handleStart = () => {
    setIsRunning(true)
    setIsPaused(false)
    console.log('Started')
  }

  const handleStop = () => {
    setIsRunning(false)
    setIsPaused(false)
    console.log('Stopped')
  }

  const handlePauseResume = () => {
    if (isRunning) {
      setIsPaused(!isPaused)
      console.log(isPaused ? 'Resumed' : 'Paused')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      {/* YouTube-style Header */}
      <div className="flex items-center mb-12">
        <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mr-4">
          <Mic size={32} className="text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white">
          ActiveLens Control Panel
        </h1>
      </div>

      <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-700 max-w-4xl w-full">
        <div className="flex justify-center gap-16">
          {/* Start Button - Round Icon Only */}
          <button
            type="button"
            onClick={handleStart}
            disabled={isRunning && !isPaused}
            className={`
              w-40 h-40 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 active:scale-95 p-8
              ${
                isRunning && !isPaused
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl'
              }
            `}
            title="Start Recording"
          >
            <Play size={56} />
          </button>

          {/* Stop Button - Round Icon Only */}
          <button
            type="button"
            onClick={handleStop}
            disabled={!isRunning}
            className={`
              w-40 h-40 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 active:scale-95 p-8
              ${
                !isRunning
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-700 hover:bg-gray-600 text-white shadow-lg hover:shadow-xl'
              }
            `}
            title="Stop Recording"
          >
            <Square size={56} />
          </button>

          {/* Pause/Resume Button - Round Icon Only */}
          <button
            type="button"
            onClick={handlePauseResume}
            disabled={!isRunning}
            className={`
              w-40 h-40 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 active:scale-95 p-8
              ${
                !isRunning
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
              }
            `}
            title={isPaused ? 'Resume Recording' : 'Pause Recording'}
          >
            {isPaused ? <Play size={56} /> : <Pause size={56} />}
          </button>
        </div>

        {/* YouTube-style Status Display */}
        <div className="mt-8 flex justify-center">
          <div className="flex items-center gap-3 bg-gray-700 px-6 py-3 rounded-full">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
            <span className="text-white font-medium">{getStatusText()}</span>
          </div>
        </div>

        {/* YouTube-style Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            Click Start Recording to begin capturing your screen
          </p>
        </div>
      </div>
    </div>
  )
}
