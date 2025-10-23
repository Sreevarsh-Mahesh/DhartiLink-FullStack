'use client'

import React, { useState, useEffect } from 'react'
import { Check } from 'lucide-react'
import { useSoundManager } from '@/components/sound-manager'

interface DhartiPaySuccessProps {
  onComplete: () => void
}

export default function DhartiPaySuccess({ onComplete }: DhartiPaySuccessProps) {
  const { playButtonClick } = useSoundManager()
  const [progress, setProgress] = useState(0)
  const [showCheck, setShowCheck] = useState(false)

  useEffect(() => {
    playButtonClick()

    // Smooth progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 3.33
      })
    }, 50)

    // Show check at 100%
    const checkTimer = setTimeout(() => setShowCheck(true), 1500)

    // Complete
    const completeTimer = setTimeout(() => {
      onComplete()
    }, 2800)

    return () => {
      clearInterval(progressInterval)
      clearTimeout(checkTimer)
      clearTimeout(completeTimer)
    }
  }, [onComplete, playButtonClick])

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center p-4 sm:p-6">
      {/* Subtle animated mesh background */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(255,255,255) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Main content container */}
      <div className="relative w-full max-w-xs sm:max-w-sm">
        {/* Main card */}
        <div className="relative">
          {/* Subtle glow effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-b from-white/5 to-white/0 rounded-2xl blur-sm" />
          
          {/* Card content */}
          <div className="relative bg-gradient-to-b from-white/[0.07] to-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 p-6 sm:p-8">
            {/* Centered logo wordmark */}
            <div className="text-center mb-6">
              <div className="inline-flex items-baseline gap-1.5">
                <span className="text-xl font-light tracking-tight text-white/90">Dharti</span>
                <span className="text-xl font-medium tracking-tight text-white">Pay</span>
              </div>
            </div>

            {/* Check circle or progress */}
            <div className="flex justify-center mb-6">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20">
                {/* Background circle */}
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="2"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="rgba(255,255,255,0.4)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                    className="transition-all duration-300 ease-out"
                    style={{
                      filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.3))'
                    }}
                  />
                </svg>
                
                {/* Center content */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {showCheck ? (
                    <div className="animate-scale-in">
                      <Check className="w-8 h-8 sm:w-10 sm:h-10 text-white" strokeWidth={2.5} />
                    </div>
                  ) : (
                    <span className="text-base sm:text-lg font-light text-white/90 tabular-nums">
                      {Math.round(progress)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Status text */}
            <div className="text-center space-y-1.5">
              <h3 className="text-base sm:text-lg font-medium text-white/90">
                {showCheck ? 'Payment Verified' : 'Processing Payment'}
              </h3>
              <p className="text-xs sm:text-sm text-white/40 font-light">
                {showCheck ? 'Transaction complete' : 'Please wait...'}
              </p>
            </div>

            {/* Minimal progress indicator */}
            {!showCheck && (
              <div className="mt-6 flex justify-center gap-1">
                <div className="w-1 h-1 rounded-full bg-white/30 animate-pulse" />
                <div className="w-1 h-1 rounded-full bg-white/30 animate-pulse" style={{ animationDelay: '0.15s' }} />
                <div className="w-1 h-1 rounded-full bg-white/30 animate-pulse" style={{ animationDelay: '0.3s' }} />
              </div>
            )}

            {/* Subtle footer text */}
            {showCheck && (
              <div className="mt-6 text-center animate-fade-in">
                <p className="text-xs text-white/30 font-light tracking-wide">
                  Finalizing transaction
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }
      `}</style>
    </div>
  )
}
