interface RecordingDurationProps {
  duration: number
}

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const milliseconds = Math.floor((seconds % 1) * 1000)

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`
  }
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`
}

export default function RecordingDuration({
  duration,
}: RecordingDurationProps) {
  return (
    <div className="flex justify-center mb-8">
      <div className="bg-gray-900 rounded-xl px-10 py-4 border border-gray-600">
        <div className="text-center">
          <div className="text-4xl font-mono font-bold text-white mb-2">
            {formatDuration(duration)}
          </div>
          <div className="text-sm text-gray-400">Recording Duration</div>
        </div>
      </div>
    </div>
  )
}
