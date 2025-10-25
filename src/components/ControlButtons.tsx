import { Play, Square, Pause } from 'lucide-react'

interface ControlButtonsProps {
  isRunning: boolean
  isPaused: boolean
  onStart: () => void
  onStop: () => void
  onPauseResume: () => void
}

export default function ControlButtons({
  isRunning,
  isPaused,
  onStart,
  onStop,
  onPauseResume,
}: ControlButtonsProps) {
  return (
    <div className="flex justify-center gap-16">
      <button
        type="button"
        onClick={onStart}
        disabled={isRunning && !isPaused}
        className={`
          w-30 h-30 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 active:scale-95 p-8
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

      <button
        type="button"
        onClick={onStop}
        disabled={!isRunning}
        className={`
          w-30 h-30 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 active:scale-95 p-8
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

      <button
        type="button"
        onClick={onPauseResume}
        disabled={!isRunning}
        className={`
          w-30 h-30 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 active:scale-95 p-8
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
  )
}
