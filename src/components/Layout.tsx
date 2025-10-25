import AppHeader from '@/components/AppHeader'
import Navigation from '@/components/Navigation'
import { LayoutProps } from '@/types'

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="max-w-[720px] w-[720px] flex flex-col items-center justify-start min-h-screen p-8 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      <AppHeader />
      <Navigation />
      <div className="w-full flex justify-center">{children}</div>
    </div>
  )
}
