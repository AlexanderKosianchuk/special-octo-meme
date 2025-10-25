import { useState, useRef, useEffect } from 'react'
import Layout from '@/components/Layout'
import ControlButtons from '@/components/ControlButtons'

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognitionResult {
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
  isFinal: boolean
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

export default function Transcript() {
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const transcriptRef = useRef<HTMLDivElement>(null)

  // Check for Web Speech API support
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setIsSupported(false)
      setError(
        'Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.',
      )
      return
    }

    // Initialize speech recognition
    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i]
        const { transcript: transcriptText } = result[0]

        if (result.isFinal) {
          finalTranscript += transcriptText
        } else {
          interimTranscript += transcriptText
        }
      }

      setTranscript((prev) => {
        const newTranscript = prev + finalTranscript + interimTranscript
        return newTranscript
      })

      // Auto-scroll to bottom
      if (transcriptRef.current) {
        transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // eslint-disable-next-line no-console
      console.error('Speech recognition error:', event.error)
      setError(`Speech recognition error: ${event.error}`)
      setIsRunning(false)
      setIsPaused(false)
    }

    recognition.onend = () => {
      if (isRunning && !isPaused) {
        // Restart recognition if it ended unexpectedly
        setTimeout(() => {
          if (recognitionRef.current && isRunning && !isPaused) {
            recognitionRef.current.start()
          }
        }, 100)
      }
    }

    recognitionRef.current = recognition
  }, [isRunning, isPaused])

  const handleStart = () => {
    if (!recognitionRef.current) return

    try {
      setError(null)
      setTranscript('')
      recognitionRef.current.start()
      setIsRunning(true)
      setIsPaused(false)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error starting speech recognition:', err)
      setError(
        'Failed to start speech recognition. Please check your microphone permissions.',
      )
    }
  }

  const handleStop = () => {
    if (!recognitionRef.current) return

    recognitionRef.current.stop()
    setIsRunning(false)
    setIsPaused(false)
  }

  const handlePauseResume = () => {
    if (!recognitionRef.current) return

    if (isPaused) {
      // Resume recognition
      try {
        recognitionRef.current.start()
        setIsPaused(false)
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error resuming speech recognition:', err)
        setError('Failed to resume speech recognition.')
      }
    } else {
      // Pause recognition
      recognitionRef.current.stop()
      setIsPaused(true)
    }
  }

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  if (!isSupported) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center w-full">
          <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-700 max-w-4xl w-full">
            <div className="text-center text-red-400 py-8">
              <h2 className="text-xl font-bold mb-4">
                Speech Recognition Not Supported
              </h2>
              <p>{error}</p>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

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
              Live Transcript
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
                    ? 'Listening... Speak into your microphone to see the transcript appear here.'
                    : 'Click "Start Recording" to begin speech recognition.'}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 text-center text-gray-400 text-sm">
            {isRunning && (
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span>Speech recognition active</span>
              </div>
            )}
            {isPaused && (
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                <span>Speech recognition paused</span>
              </div>
            )}
            {!isRunning && !isPaused && (
              <span>Ready to start speech recognition</span>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
