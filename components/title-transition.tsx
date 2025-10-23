"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useSoundManager } from "@/components/sound-manager"

export default function TitleTransition() {
  const [idx, setIdx] = useState(0)
  const [blink, setBlink] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showMainTitle, setShowMainTitle] = useState(false)
  const [isDrifting, setIsDrifting] = useState(false)
  const [progress, setProgress] = useState(0)
  const titleRef = useRef<HTMLDivElement | null>(null)
  
  const { playLanguageChange, playHoloBeep } = useSoundManager()

  const dhartiTranslations = useMemo(
    () => [
      "Dharti", 
      "धरती", 
      "தர்தி", 
      "ధర్తి", 
      "ધર્તી", 
      "ধর্তি", 
      "धर्ती", 
      "धरती", 
      "Dharti"
    ],
    [],
  )

  useEffect(() => {
    // Progress animation - start immediately
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 2.5 // 4000ms / 100 = 40ms per 2.5%
        return newProgress >= 100 ? 100 : newProgress
      })
    }, 100) // Update every 100ms
    
    // Simple fade transition after loading screen
    const transitionTimer = setTimeout(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setShowMainTitle(true)
      }, 1000) // Fade out duration
    }, 4000) // After loading screen duration

    return () => {
      clearTimeout(transitionTimer)
      clearInterval(progressInterval)
    }
  }, [])

  useEffect(() => {
    const i = setInterval(() => {
      setBlink(true)
      playLanguageChange()
      setTimeout(() => {
        setIdx((p) => (p + 1) % dhartiTranslations.length)
        setBlink(false)
      }, 300)
    }, 2000)
    return () => clearInterval(i)
  }, [dhartiTranslations.length])

  if (!showMainTitle) {
    return (
      <>
        {/* Background overlay that fades out */}
        <div 
          className={`fixed inset-0 z-[50] bg-black transition-opacity duration-1500 ${
            isTransitioning ? 'opacity-0' : 'opacity-100'
          }`}
          style={{
            transition: 'opacity 1.5s cubic-bezier(0.15, 0.35, 0.25, 0.95)'
          }}
        />
        {/* Title container */}
        <div 
          ref={titleRef}
          className={`fixed inset-0 z-[60] flex items-center justify-center transition-opacity duration-1000 ease-out ${
            isTransitioning ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
        <div className="text-center">
          <div className="text-xs tracking-[0.35em] text-gray-400 mb-8">INITIALIZING</div>
          <div className="relative">
            <h1 className="text-6xl font-semibold md:text-8xl text-amber-50 flex items-baseline justify-center">
              <span
                className={
                  "transition-all duration-500 ease-in-out relative inline-block " +
                  (blink ? "opacity-0 scale-95" : "opacity-100 scale-100")
                }
                style={{ 
                  fontFamily: 'serif',
                  fontWeight: 'normal',
                  fontStyle: 'italic'
                }}
              >
                {dhartiTranslations[idx]}
                <div 
                  className="absolute -bottom-2 left-0 right-0 h-1 rounded-full"
                  style={{ 
                    background: 'linear-gradient(90deg, #ef4444, #dc2626)',
                    boxShadow: '0 0 8px rgba(239, 68, 68, 0.5)'
                  }}
                />
              </span>
              <span 
                className="ml-2 font-black uppercase tracking-widest flex-shrink-0" 
                style={{ 
                  fontFamily: 'sans-serif',
                  fontWeight: '900',
                  letterSpacing: '0.1em',
                  minWidth: 'fit-content'
                }}
              >
                Link
              </span>
            </h1>
            <span className="text-sm md:text-base text-accent-foreground/70 font-medium tracking-wide uppercase block mt-2">
              UPI for Land Ownership
            </span>
            <div className="mx-auto mt-12 h-2 w-48 overflow-hidden rounded-full bg-gray-800/50">
              <div 
                className="h-full transition-all duration-100 ease-out"
                style={{ 
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #00e5ff, #6cf2ff)',
                  boxShadow: '0 0 12px rgba(0, 229, 255, 0.8)'
                }}
              />
            </div>
          </div>
        </div>
        </div>
      </>
    )
  }

  return (
    <div>
      <h1 className="text-6xl font-semibold md:text-8xl text-amber-50 flex items-baseline">
        <span
          className={
            "transition-all duration-500 ease-in-out relative inline-block " +
            (blink ? "opacity-0 scale-95" : "opacity-100 scale-100")
          }
          style={{ 
            fontFamily: 'serif',
            fontWeight: 'normal',
            fontStyle: 'italic'
          }}
        >
          {dhartiTranslations[idx]}
          <div 
            className="absolute -bottom-2 left-0 right-0 h-1 rounded-full"
            style={{ 
              background: 'linear-gradient(90deg, #ef4444, #dc2626)',
              boxShadow: '0 0 8px rgba(239, 68, 68, 0.5)'
            }}
          />
        </span>
        <span 
          className="ml-2 font-black uppercase tracking-widest flex-shrink-0" 
          style={{ 
            fontFamily: 'sans-serif',
            fontWeight: '900',
            letterSpacing: '0.1em',
            minWidth: 'fit-content'
          }}
        >
          Link
        </span>
      </h1>
      <span className="text-sm md:text-base text-accent-foreground/70 font-medium tracking-wide uppercase block mt-2">
        UPI for Land Ownership
      </span>
    </div>
  )
}
