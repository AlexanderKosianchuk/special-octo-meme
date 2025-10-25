import { useState, useRef, useEffect } from 'react'
import Layout from '@/components/Layout'
import ControlButtons from '@/components/ControlButtons'

export default function Transcript() {
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)

  const transcriptRef = useRef<HTMLDivElement>(null)

  const handleStart = () => {
    try {
      setError(null)
      setTranscript('')
      setIsRunning(true)
      setIsPaused(false)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error starting:', err)
      setError('Failed to start.')
    }
  }

  const handleStop = () => {
    setIsRunning(false)
    setIsPaused(false)
  }

  const handlePauseResume = () => {
    if (isPaused) {
      setIsPaused(false)
    } else {
      setIsPaused(true)
    }
  }

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      // Cleanup if needed
    }
  }, [])

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center w-full">
        <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-700 max-w-4xl w-full">
          <div className="mb-6">
            <ControlButtons
              isRunning={isRunning}
              isPaused={isPaused}
              onStart={handleStart}
              onStop={handleStop}
              onPauseResume={handlePauseResume}
              size="small"
            />
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          <div className="mt-6 overflow-x-auto max-h-[280px] overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-3">
              Transcript
            </h3>
            <div
              ref={transcriptRef}
              className="bg-gray-900 rounded-lg p-4 h-96 overflow-y-auto border border-gray-600"
            >
              {transcript ? (
                <div className="text-gray-100 whitespace-pre-wrap leading-relaxed">
                  {transcript}
                </div>
              ) : (
                <div className="text-gray-500 italic">
                  {isRunning
                    ? 'Recording...'
                    : 'Click "Start Recording" to begin.'}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 text-center text-gray-400 text-sm">
            {isRunning && (
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span>Recording active</span>
              </div>
            )}
            {isPaused && (
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                <span>Recording paused</span>
              </div>
            )}
            {!isRunning && !isPaused && (
              <span>Ready to start recording</span>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
