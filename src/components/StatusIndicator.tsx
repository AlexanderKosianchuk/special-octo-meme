interface StatusIndicatorProps {
  isRunning: boolean
  isPaused: boolean
}

export default function StatusIndicator({
  isRunning,
  isPaused,
}: StatusIndicatorProps) {
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

  return (
    <div className="mt-8 flex justify-center">
      <div className="flex items-center gap-3 bg-gray-700 px-6 py-3 rounded-full">
        <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
        <span className="text-white font-medium">{getStatusText()}</span>
      </div>
    </div>
  )
}
