import { useState, useRef, useEffect } from 'react'
import RecordingDuration from '@/components/RecordingDuration'
import AudioFormatSelector from '@/components/AudioFormatSelector'
import Layout from '@/components/Layout'
import ControlButtons from '@/components/ControlButtons'
import StatusIndicator from '@/components/StatusIndicator'
import HelpText from '@/components/HelpText'
import { AudioFormat } from '@/main/audio-recording-ipc'

const CHUNK_SIZE = 100 // 100ms
export default function Home() {
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [audioFormat, setAudioFormat] = useState<AudioFormat>('webm')

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

      setDuration(accumulatedPausedTimeRef.current)
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

      const sessionResult = await window.electron.ipcRenderer.invoke(
        'start-recording-stream',
        audioFormat,
      )
      if (!sessionResult.success) {
        throw new Error(sessionResult.error)
      }

      recordingSessionIdRef.current = sessionResult.sessionId

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0 && recordingSessionIdRef.current) {
          try {
            const arrayBuffer = await event.data.arrayBuffer()
            const buffer = new Uint8Array(arrayBuffer)

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

      mediaRecorder.start(CHUNK_SIZE)
      setIsRunning(true)
      setIsPaused(false)

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

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      mediaStreamRef.current = null
    }

    setIsRunning(false)
    setIsPaused(false)

    stopTimer()
  }

  const handlePauseResume = () => {
    if (mediaRecorderRef.current && isRunning) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        setIsPaused(false)

        resumeTimer()
      } else {
        mediaRecorderRef.current.pause()
        setIsPaused(true)

        pauseTimer()
      }
    }
  }

  // Load saved audio format on mount
  useEffect(() => {
    const loadAudioFormat = async () => {
      try {
        const result =
          await window.electron.ipcRenderer.invoke('get-audio-format')
        if (result.success) {
          setAudioFormat(result.audioFormat)
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error loading audio format preference:', error)
      }
    }

    loadAudioFormat()
  }, [])

  // Save audio format when it changes
  useEffect(() => {
    const saveAudioFormat = async () => {
      try {
        await window.electron.ipcRenderer.invoke(
          'set-audio-format',
          audioFormat,
        )
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error saving audio format preference:', error)
      }
    }

    saveAudioFormat()
  }, [audioFormat])

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
    <Layout>
      <div className="flex flex-col items-center justify-center w-full">
        <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-700 max-w-4xl w-full">
          <div className="flex gap-8 mb-4">
            <div className="flex-1">
              <RecordingDuration duration={duration} />
            </div>
            <div className="flex-1">
              <AudioFormatSelector
                audioFormat={audioFormat}
                setAudioFormat={setAudioFormat}
                isRunning={isRunning}
              />
            </div>
          </div>

          <ControlButtons
            isRunning={isRunning}
            isPaused={isPaused}
            onStart={handleStart}
            onStop={handleStop}
            onPauseResume={handlePauseResume}
          />

          <StatusIndicator isRunning={isRunning} isPaused={isPaused} />

          <HelpText audioFormat={audioFormat} />
        </div>
      </div>
    </Layout>
  )
}
