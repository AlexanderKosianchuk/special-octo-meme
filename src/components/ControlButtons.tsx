import { Play, Square, Pause } from 'lucide-react'
import { ControlButtonsProps } from '@/types'

export default function ControlButtons({
  isRunning,
  isPaused,
  onStart,
  onStop,
  onPauseResume,
  size = 'normal',
}: ControlButtonsProps) {
  const isSmall = size === 'small'
  const buttonSize = isSmall ? 'w-15 h-15' : 'w-30 h-30'
  const iconSize = isSmall ? 28 : 56
  const gapSize = isSmall ? 'gap-8' : 'gap-16'
  const paddingSize = isSmall ? 'p-4' : 'p-8'

  return (
    <div className={`flex justify-center ${gapSize}`}>
      <button
        type="button"
        onClick={onStart}
        disabled={isRunning && !isPaused}
        className={`
          ${buttonSize} rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 active:scale-95 ${paddingSize}
          ${
            isRunning && !isPaused
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl'
          }
        `}
        title="Start Recording"
      >
        <Play size={iconSize} />
      </button>

      <button
        type="button"
        onClick={onStop}
        disabled={!isRunning}
        className={`
          ${buttonSize} rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 active:scale-95 ${paddingSize}
          ${
            !isRunning
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-gray-700 hover:bg-gray-600 text-white shadow-lg hover:shadow-xl'
          }
        `}
        title="Stop Recording"
      >
        <Square size={iconSize} />
      </button>

      <button
        type="button"
        onClick={onPauseResume}
        disabled={!isRunning}
        className={`
          ${buttonSize} rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 active:scale-95 ${paddingSize}
          ${
            !isRunning
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
          }
        `}
        title={isPaused ? 'Resume Recording' : 'Pause Recording'}
      >
        {isPaused ? <Play size={iconSize} /> : <Pause size={iconSize} />}
      </button>
    </div>
  )
}
