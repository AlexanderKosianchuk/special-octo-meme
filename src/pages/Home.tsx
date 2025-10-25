import { useState, useRef, useEffect } from 'react'
import { Play, Square, Pause, Mic } from 'lucide-react'

export default function Home() {
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  // Timer state
  const [duration, setDuration] = useState(0)

  // Audio recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const recordingSessionIdRef = useRef<string | null>(null)
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Timer refs for accurate tracking
  const timerStartTimeRef = useRef<number | null>(null)
  const accumulatedPausedTimeRef = useRef<number>(0)

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

  const startTimer = () => {
    const now = Date.now()
    timerStartTimeRef.current = now
    accumulatedPausedTimeRef.current = 0

    timerIntervalRef.current = setInterval(() => {
      if (timerStartTimeRef.current) {
        const elapsed = (Date.now() - timerStartTimeRef.current) / 1000
        setDuration(elapsed + accumulatedPausedTimeRef.current)
      }
    }, 10) // Update every 10ms for smooth millisecond display
  }

  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
    setDuration(0)
    timerStartTimeRef.current = null
    accumulatedPausedTimeRef.current = 0
  }

  const pauseTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
    if (timerStartTimeRef.current) {
      const elapsed = (Date.now() - timerStartTimeRef.current) / 1000
      accumulatedPausedTimeRef.current += elapsed
    }
  }

  const resumeTimer = () => {
    const now = Date.now()
    timerStartTimeRef.current = now

    timerIntervalRef.current = setInterval(() => {
      if (timerStartTimeRef.current) {
        const elapsed = (Date.now() - timerStartTimeRef.current) / 1000
        setDuration(elapsed + accumulatedPausedTimeRef.current)
      }
    }, 10) // Update every 10ms for smooth millisecond display
  }

  const handleStart = async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      })
      mediaRecorderRef.current = mediaRecorder

      // Start recording session with streaming
      const sessionResult = await window.electron.ipcRenderer.invoke(
        'start-recording-stream',
      )
      if (!sessionResult.success) {
        throw new Error(sessionResult.error)
      }

      recordingSessionIdRef.current = sessionResult.sessionId
      // eslint-disable-next-line no-console
      console.log('Recording session started:', sessionResult.filePath)

      // Handle data available event - stream chunks in real-time
      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0 && recordingSessionIdRef.current) {
          try {
            // Convert blob to buffer
            const arrayBuffer = await event.data.arrayBuffer()
            const buffer = new Uint8Array(arrayBuffer)

            // Stream chunk to file immediately
            await window.electron.ipcRenderer.invoke(
              'write-recording-chunk',
              recordingSessionIdRef.current,
              buffer,
            )
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Error streaming chunk:', error)
          }
        }
      }

      // Handle recording stop event
      mediaRecorder.onstop = async () => {
        if (recordingSessionIdRef.current) {
          try {
            // Finish the recording session
            await window.electron.ipcRenderer.invoke(
              'finish-recording-stream',
              recordingSessionIdRef.current,
            )
            // eslint-disable-next-line no-console
            console.log('Recording session finished')
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Error finishing recording session:', error)
          }
          recordingSessionIdRef.current = null
        }
      }

      // Start recording with small time slices for real-time streaming
      mediaRecorder.start(100) // 100ms chunks
      setIsRunning(true)
      setIsPaused(false)

      // Start the timer
      startTimer()

      // eslint-disable-next-line no-console
      console.log('Recording started with real-time streaming')
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error starting recording:', error)
      // eslint-disable-next-line no-alert
      alert('Failed to access microphone. Please check your permissions.')
    }
  }

  const handleStop = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      mediaRecorderRef.current.stop()
    }

    // Stop all media stream tracks
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      mediaStreamRef.current = null
    }

    setIsRunning(false)
    setIsPaused(false)

    // Stop the timer
    stopTimer()

    // eslint-disable-next-line no-console
    console.log('Recording stopped')
  }

  const handlePauseResume = () => {
    if (mediaRecorderRef.current && isRunning) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        setIsPaused(false)

        // Resume the timer
        resumeTimer()

        // eslint-disable-next-line no-console
        console.log('Recording resumed')
      } else {
        mediaRecorderRef.current.pause()
        setIsPaused(true)

        // Pause the timer
        pauseTimer()

        // eslint-disable-next-line no-console
        console.log('Recording paused')
      }
    }
  }

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
      timerStartTimeRef.current = null
      accumulatedPausedTimeRef.current = 0
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      {/* YouTube-style Header */}
      <div className="flex items-center mb-12">
        <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mr-4">
          <Mic size={32} className="text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white">Control Panel</h1>
      </div>

      <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-700 max-w-4xl w-full">
        {/* Timer Display */}
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
            Click Start Recording to begin capturing audio from your microphone
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Recordings will be saved to your Desktop
          </p>
        </div>
      </div>
    </div>
  )
}
