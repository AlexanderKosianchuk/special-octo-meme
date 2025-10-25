import { HelpTextProps } from '@/types'

export default function HelpText({ audioFormat }: HelpTextProps) {
  return (
    <div className="mt-6 text-center">
      <p className="text-gray-400 text-sm">
        Click Start Recording to begin capturing audio from your microphone
      </p>
      <p className="text-gray-500 text-xs mt-2">
        Recordings will be saved to your Desktop as {audioFormat.toUpperCase()}{' '}
        files
      </p>
    </div>
  )
}
