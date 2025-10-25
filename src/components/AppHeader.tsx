import { Mic } from 'lucide-react'

export default function AppHeader() {
  return (
    <div className="flex items-center mb-12">
      <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mr-4">
        <Mic size={32} className="text-white" />
      </div>
      <h1 className="text-4xl font-bold text-white">Control Panel</h1>
    </div>
  )
}
