'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, Zap, TrendingUp, Shield } from 'lucide-react'
import { useSoundManager } from '@/components/sound-manager'

interface PurchaseSuccessProps {
  landTitle: string
  landId: string
  onComplete?: () => void
}

export function PurchaseSuccess({ landTitle, landId, onComplete }: PurchaseSuccessProps) {
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState(0) // 0: initial, 1: verified, 2: complete
  const { playSuccess } = useSoundManager()

  useEffect(() => {
    playSuccess()

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 4
      })
    }, 30)

    // Stage transitions
    const stage1Timer = setTimeout(() => setStage(1), 800)
    const stage2Timer = setTimeout(() => setStage(2), 1600)

    // Complete
    const completeTimer = setTimeout(() => {
      if (onComplete) onComplete()
      const switchToPortfolioEvent = new CustomEvent('switchToPortfolio')
      window.dispatchEvent(switchToPortfolioEvent)
    }, 3000)

    return () => {
      clearInterval(progressInterval)
      clearTimeout(stage1Timer)
      clearTimeout(stage2Timer)
      clearTimeout(completeTimer)
    }
  }, [playSuccess, onComplete])

  return (
    <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
      {/* Animated background gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[100%] opacity-30">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-emerald-500/30 via-green-500/30 to-teal-500/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-emerald-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>
      </div>

      {/* Main Container */}
      <div className="relative w-full max-w-md">
        {/* Success Check Circle */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            {/* Animated rings */}
            <div className={`absolute inset-0 rounded-full border-4 border-emerald-400/30 transition-all duration-1000 ${stage >= 0 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} style={{ width: '120px', height: '120px', margin: '-10px' }} />
            <div className={`absolute inset-0 rounded-full border-4 border-emerald-400/20 transition-all duration-1000 delay-100 ${stage >= 0 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} style={{ width: '140px', height: '140px', margin: '-20px' }} />
            
            {/* Main circle */}
            <div className={`relative w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-2xl shadow-emerald-500/50 transition-all duration-700 ${stage >= 0 ? 'scale-100 rotate-0' : 'scale-0 rotate-180'}`}>
              <div className="absolute inset-0 rounded-full bg-gradient-to-t from-white/0 to-white/20" />
              <CheckCircle className="w-14 h-14 text-white relative z-10" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className={`text-center mb-6 transition-all duration-700 delay-200 ${stage >= 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Purchase Successful
          </h2>
          <div className="h-1 w-20 mx-auto bg-gradient-to-r from-emerald-400 to-green-500 rounded-full" />
        </div>

        {/* Info Cards */}
        <div className="space-y-3 mb-6">
          {/* Property Card */}
          <div className={`glass border border-white/10 rounded-xl p-4 transition-all duration-700 delay-300 ${stage >= 0 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Property</p>
                <p className="text-white font-semibold truncate">{landTitle}</p>
              </div>
            </div>
          </div>

          {/* Land ID Card */}
          <div className={`glass border border-white/10 rounded-xl p-4 transition-all duration-700 delay-400 ${stage >= 1 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Land ID</p>
                <p className="text-white font-mono text-sm truncate">{landId}</p>
              </div>
            </div>
          </div>

          {/* Status Card */}
          <div className={`glass border border-emerald-500/30 rounded-xl p-4 bg-emerald-500/5 transition-all duration-700 delay-500 ${stage >= 2 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-emerald-400 font-semibold text-sm">Added to Portfolio</p>
                <p className="text-xs text-gray-400">View in your dashboard</p>
              </div>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className={`transition-all duration-700 delay-600 ${stage >= 0 ? 'opacity-100' : 'opacity-0'}`}>
          <div className="h-1.5 bg-gray-800/50 rounded-full overflow-hidden backdrop-blur-sm">
            <div 
              className="h-full bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-400 rounded-full transition-all duration-300 ease-out relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 mt-2">Redirecting to portfolio...</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  )
}
