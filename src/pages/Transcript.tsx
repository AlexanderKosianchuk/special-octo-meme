import { useState, useRef, useEffect, useCallback } from 'react'
import Layout from '@/components/Layout'
import ControlButtons from '@/components/ControlButtons'

// TypeScript declarations for Web Speech API
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

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
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
    webkitSpeechRecognition: new () => SpeechRecognition
    SpeechRecognition: new () => SpeechRecognition
  }
}

export default function Transcript() {
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(true)
  const [audioLevel, setAudioLevel] = useState(0)
  const [micPermission, setMicPermission] = useState<
    'unknown' | 'granted' | 'denied'
  >('unknown')
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)
  const [isMicActive, setIsMicActive] = useState(false)

  const transcriptRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const retryTimeoutRef = useRef<number | null>(null)

  // Retry mechanism for speech recognition
  const retrySpeechRecognition = useCallback(() => {
    if (retryCount >= 3) {
      setError(
        'Speech recognition failed after multiple attempts. Please check your internet connection and try again.',
      )
      setIsRetrying(false)
      setIsRunning(false)
      return
    }

    setIsRetrying(true)
    setRetryCount((prev) => prev + 1)

    // Wait 2 seconds before retrying
    retryTimeoutRef.current = window.setTimeout(() => {
      if (recognitionRef.current && isRunning) {
        try {
          recognitionRef.current.start()
          setIsRetrying(false)
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('Error retrying speech recognition:', err)
          retrySpeechRecognition()
        }
      }
    }, 2000)
  }, [retryCount, isRunning])

  // Check microphone permission and availability
  useEffect(() => {
    const checkMicrophonePermission = async () => {
      try {
        if (navigator.permissions) {
          const permission = await navigator.permissions.query({
            name: 'microphone' as any,
          })
          const permissionState =
            permission.state === 'prompt' ? 'unknown' : permission.state
          setMicPermission(permissionState as 'unknown' | 'granted' | 'denied')

          permission.onchange = () => {
            const newState =
              permission.state === 'prompt' ? 'unknown' : permission.state
            setMicPermission(newState as 'unknown' | 'granted' | 'denied')
          }
        } else {
          // Fallback: try to access microphone
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          })
          setMicPermission('granted')
          stream.getTracks().forEach((track) => track.stop())
        }
      } catch {
        setMicPermission('denied')
        setError(
          'Microphone access denied. Please allow microphone access to use speech recognition.',
        )
      }
    }

    checkMicrophonePermission()
  }, [])

  // Audio level monitoring
  const startAudioLevelMonitoring = async () => {
    try {
      // eslint-disable-next-line no-console
      console.log('Requesting microphone access...')

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      })

      // eslint-disable-next-line no-console
      console.log('Microphone stream obtained:', stream)
      // eslint-disable-next-line no-console
      console.log('Audio tracks:', stream.getAudioTracks())

      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)()

      // eslint-disable-next-line no-console
      console.log('Audio context created:', audioContext.state)

      const analyser = audioContext.createAnalyser()
      const microphone = audioContext.createMediaStreamSource(stream)

      analyser.fftSize = 1024
      analyser.smoothingTimeConstant = 0.3
      analyser.minDecibels = -90
      analyser.maxDecibels = -10
      microphone.connect(analyser)

      audioContextRef.current = audioContext
      analyserRef.current = analyser
      microphoneRef.current = microphone

      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      let silenceCount = 0

      const updateAudioLevel = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray)

          // Calculate RMS (Root Mean Square) for better audio level detection
          let sum = 0
          for (let i = 0; i < dataArray.length; i += 1) {
            sum += dataArray[i] * dataArray[i]
          }
          const rms = Math.sqrt(sum / dataArray.length)
          const normalizedLevel = Math.min(rms / 128, 1)

          // Detect if microphone is actually picking up sound
          const isActive = normalizedLevel > 0.005 // Lower threshold for better detection

          if (isActive) {
            silenceCount = 0
            setIsMicActive(true)
          } else {
            silenceCount += 1
            if (silenceCount > 5) {
              // After 5 frames of silence (faster response)
              setIsMicActive(false)
            }
          }

          setAudioLevel(normalizedLevel)

          // Debug logging - show all levels for debugging
          // eslint-disable-next-line no-console
          console.log(
            `Audio level: ${normalizedLevel.toFixed(4)}, Active: ${isActive}, Raw RMS: ${rms.toFixed(2)}, Max: ${Math.max(...dataArray)}`,
          )

          // Continue monitoring even if not running (for debugging)
          animationFrameRef.current = requestAnimationFrame(updateAudioLevel)
        }
      }

      // Start monitoring immediately
      updateAudioLevel()

      // eslint-disable-next-line no-console
      console.log('Audio level monitoring started')
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(
        'Error accessing microphone for audio level monitoring:',
        err,
      )
      setError(
        `Microphone access failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
      )
    }
  }

  const stopAudioLevelMonitoring = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    if (microphoneRef.current) {
      microphoneRef.current.disconnect()
      microphoneRef.current = null
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    analyserRef.current = null
    setAudioLevel(0)
    setIsMicActive(false)
  }

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognitionClass =
      window.webkitSpeechRecognition || window.SpeechRecognition

    if (!SpeechRecognitionClass) {
      setIsSupported(false)
      setError('Speech recognition is not supported in this browser.')
      return undefined
    }

    const recognition = new SpeechRecognitionClass()
    recognitionRef.current = recognition

    // Configure recognition settings
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    // recognition.maxAlternatives = 1 // Not supported in all browsers

    // eslint-disable-next-line no-console
    console.log('Speech recognition configured:', {
      continuous: recognition.continuous,
      interimResults: recognition.interimResults,
      lang: recognition.lang,
    })

    // Handle recognition results
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      // eslint-disable-next-line no-console
      console.log('Speech recognition result:', event)

      let finalTranscript = ''
      let interimText = ''

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i]
        const { transcript: transcriptText, confidence } = result[0]

        // eslint-disable-next-line no-console
        console.log(`Result ${i}:`, {
          transcript: transcriptText,
          confidence,
          isFinal: result.isFinal,
        })

        if (result.isFinal) {
          finalTranscript += transcriptText
        } else {
          interimText += transcriptText
        }
      }

      if (finalTranscript) {
        // eslint-disable-next-line no-console
        console.log('Final transcript added:', finalTranscript)
        setTranscript((prev) => {
          const newTranscript = prev + finalTranscript
          // eslint-disable-next-line no-console
          console.log('Updated transcript:', newTranscript)
          return newTranscript
        })
        setInterimTranscript('')
      } else if (interimText) {
        // eslint-disable-next-line no-console
        console.log('Interim transcript:', interimText)
        setInterimTranscript(interimText)
      }
    }

    // Handle recognition errors
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // eslint-disable-next-line no-console
      console.error('Speech recognition error:', event.error)

      let errorMessage = ''
      let shouldRetry = false

      switch (event.error) {
        case 'network':
          errorMessage = 'Network error: Please check your internet connection.'
          shouldRetry = true
          break
        case 'aborted':
          errorMessage = 'Speech recognition was aborted. Retrying...'
          shouldRetry = true
          break
        case 'not-allowed':
          errorMessage =
            'Microphone access denied. Please allow microphone access.'
          setMicPermission('denied')
          break
        case 'no-speech':
          errorMessage = 'No speech detected. Please try speaking louder.'
          shouldRetry = true
          break
        case 'audio-capture':
          errorMessage = 'Audio capture error. Please check your microphone.'
          break
        case 'service-not-allowed':
          errorMessage =
            'Speech recognition service not allowed. Please check your browser settings.'
          break
        default:
          errorMessage = `Speech recognition error: ${event.error}`
          shouldRetry = true
      }

      setError(errorMessage)

      if (shouldRetry && isRunning && !isPaused) {
        retrySpeechRecognition()
      } else {
        setIsRunning(false)
      }
    }

    // Handle recognition start
    ;(recognition as any).onstart = () => {
      // eslint-disable-next-line no-console
      console.log('Speech recognition started')
    }

    // Handle recognition end
    recognition.onend = () => {
      // eslint-disable-next-line no-console
      console.log('Speech recognition ended')

      if (isRunning && !isPaused) {
        // Auto-restart for continuous recognition
        try {
          // eslint-disable-next-line no-console
          console.log('Auto-restarting speech recognition...')
          recognition.start()
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('Error restarting recognition:', err)
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
        recognitionRef.current = null
      }
    }
  }, [isRunning, isPaused, retrySpeechRecognition])

  const handleStart = async () => {
    try {
      if (!isSupported) {
        setError('Speech recognition is not supported in this browser.')
        return
      }

      if (micPermission === 'denied') {
        setError(
          'Microphone access denied. Please allow microphone access to use speech recognition.',
        )
        return
      }

      setError(null)
      setTranscript('')
      setInterimTranscript('')
      setRetryCount(0)
      setIsRetrying(false)
      setIsRunning(true)
      setIsPaused(false)

      // Start audio level monitoring
      await startAudioLevelMonitoring()

      if (recognitionRef.current) {
        // eslint-disable-next-line no-console
        console.log('Starting speech recognition...')
        recognitionRef.current.start()
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error starting speech recognition:', err)
      setError('Failed to start speech recognition.')
      setIsRunning(false)
    }
  }

  const handleStop = () => {
    setIsRunning(false)
    setIsPaused(false)
    setIsRetrying(false)
    setRetryCount(0)

    // Clear retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
    }

    // Stop audio level monitoring
    stopAudioLevelMonitoring()

    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }

  const handlePauseResume = () => {
    if (isPaused) {
      setIsPaused(false)
      if (recognitionRef.current) {
        recognitionRef.current.start()
      }
    } else {
      setIsPaused(true)
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      stopAudioLevelMonitoring()
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
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

            {/* Audio Level Meter */}
            {isRunning && (
              <div className="mt-4 flex flex-col items-center justify-center gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div
                      className={`w-2 h-2 rounded-full ${isMicActive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}
                    />
                    <span className="text-sm text-gray-400">
                      {isMicActive ? 'Mic Active' : 'Mic Listening'}
                    </span>
                    <span className="text-xs text-gray-500">
                      (Level: {audioLevel.toFixed(3)})
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 10 }, (_, i) => {
                    const getBarColor = () => {
                      if (audioLevel <= i / 10) return 'bg-gray-600'
                      if (audioLevel > 0.7) return 'bg-red-500'
                      if (audioLevel > 0.4) return 'bg-yellow-500'
                      return 'bg-green-500'
                    }

                    return (
                      <div
                        key={i}
                        className={`w-2 h-6 rounded-sm transition-all duration-100 ${getBarColor()}`}
                      />
                    )
                  })}
                </div>
                <div className="text-xs text-gray-500">
                  Threshold: 0.005 | Bars: {Math.round(audioLevel * 100)}%
                </div>
              </div>
            )}
          </div>

          {/* Microphone Permission Status */}
          {micPermission === 'denied' && (
            <div className="mt-4 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span>
                  Microphone access denied. Please allow microphone access in
                  your browser settings.
                </span>
              </div>
            </div>
          )}

          {micPermission === 'unknown' && (
            <div className="mt-4 p-4 bg-yellow-900/50 border border-yellow-500 rounded-lg text-yellow-200 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                <span>
                  Microphone permission status unknown. Click Start to request
                  access.
                </span>
              </div>
            </div>
          )}

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
              {/* Debug info */}
              <div className="text-xs text-gray-500 mb-2">
                Debug: transcript=&quot;{transcript}&quot; interim=&quot;{interimTranscript}&quot; isRunning=
                {isRunning.toString()}
              </div>

              {transcript || interimTranscript ? (
                <div className="text-gray-100 whitespace-pre-wrap leading-relaxed">
                  {transcript}
                  {interimTranscript && (
                    <span className="text-gray-400 italic">
                      {interimTranscript}
                    </span>
                  )}
                </div>
              ) : (
                <div className="text-gray-500 italic">
                  {isRunning
                    ? 'Listening for speech...'
                    : 'Click "Start Recording" to begin speech recognition.'}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 text-center text-gray-400 text-sm">
            {isRetrying && (
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span>
                  Retrying speech recognition... (Attempt {retryCount}/3)
                </span>
              </div>
            )}
            {isRunning && !isRetrying && (
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Speech recognition active</span>
              </div>
            )}
            {isPaused && (
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                <span>Speech recognition paused</span>
              </div>
            )}
            {!isRunning && !isPaused && !isRetrying && (
              <span>Ready to start speech recognition</span>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
