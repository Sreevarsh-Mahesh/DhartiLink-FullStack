'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import { useSoundManager } from '@/components/sound-manager'

interface PurchaseSuccessProps {
  landTitle: string
  landId: string
  onComplete?: () => void
}

export function PurchaseSuccess({ landTitle, landId, onComplete }: PurchaseSuccessProps) {
  const [animationPhase, setAnimationPhase] = useState(0) // 0: logo, 1: transforming, 2: tick, 3: success
  const [isCompleted, setIsCompleted] = useState(false)
  const router = useRouter()
  const { playSuccess, playLoadingComplete } = useSoundManager()

  useEffect(() => {
    if (isCompleted) return // Prevent re-running if already completed

    // Play success sound immediately
    playSuccess()

    // Phase 1: Show logo for 1 second
    const logoTimer = setTimeout(() => {
      setAnimationPhase(1)
    }, 1000)

    // Phase 2: Show transforming animation for 0.5 seconds
    const transformTimer = setTimeout(() => {
      setAnimationPhase(2)
      playLoadingComplete()
    }, 1500)

    // Phase 3: Show success text after tick appears
    const successTimer = setTimeout(() => {
      setAnimationPhase(3)
    }, 2000)

    // Complete animation and redirect to portfolio after 3 seconds
    const completeTimer = setTimeout(() => {
      setIsCompleted(true)
      if (onComplete) {
        onComplete()
      }
      // Dispatch custom event to switch to portfolio tab
      const switchToPortfolioEvent = new CustomEvent('switchToPortfolio')
      window.dispatchEvent(switchToPortfolioEvent)
    }, 3000)

    return () => {
      clearTimeout(logoTimer)
      clearTimeout(transformTimer)
      clearTimeout(successTimer)
      clearTimeout(completeTimer)
    }
  }, [router, playSuccess, playLoadingComplete, isCompleted])

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
      <div className="text-center">
        {/* Phase 0: Logo */}
        {animationPhase === 0 && (
          <div className="animate-pulse">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <span className="text-white font-bold text-2xl">DL</span>
            </div>
            <h1 className="text-5xl font-bold text-blue-50 mb-2">DhartiLink</h1>
            <p className="text-gray-400 text-lg">Processing your purchase...</p>
          </div>
        )}

        {/* Phase 1: Transforming */}
        {animationPhase === 1 && (
          <div className="animate-spin">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            <h1 className="text-5xl font-bold text-blue-50 mb-2">DhartiLink</h1>
            <p className="text-gray-400 text-lg">Verifying transaction...</p>
          </div>
        )}

        {/* Phase 2: Tick Mark */}
        {animationPhase === 2 && (
          <div className="animate-scale-in">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl animate-success-pulse">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-green-500 mb-2 animate-fade-in">Success!</h1>
            <p className="text-gray-400 text-lg animate-fade-in">Transaction completed</p>
          </div>
        )}

        {/* Phase 3: Success Details */}
        {animationPhase === 3 && (
          <div className="animate-fade-in">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-green-500 mb-2">Purchase Successful!</h1>
            <p className="text-blue-50 text-xl mb-2 font-semibold">{landTitle}</p>
            <p className="text-gray-400 text-lg mb-4">Land ID: {landId}</p>
            <p className="text-gray-500 text-sm">Redirecting to your portfolio...</p>
          </div>
        )}
      </div>
    </div>
  )
}
