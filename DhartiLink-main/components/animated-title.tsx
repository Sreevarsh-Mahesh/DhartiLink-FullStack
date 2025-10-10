"use client"

import { useEffect, useMemo, useState } from "react"

export default function AnimatedTitle() {
  const [idx, setIdx] = useState(0)
  const [blink, setBlink] = useState(false)

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
    const createTransitionSound = () => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.type = 'sine'
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
        oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.2)
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime)
        gainNode.gain.linearRampToValueAtTime(0.03, audioContext.currentTime + 0.05)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
        
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.2)
      } catch (error) {
        console.warn('Audio context not available:', error)
      }
    }

    const i = setInterval(() => {
      setBlink(true)
      // Play transition sound on language change
      createTransitionSound()
      setTimeout(() => {
        setIdx((p) => (p + 1) % dhartiTranslations.length)
        setBlink(false)
      }, 300)
    }, 2000)
    return () => clearInterval(i)
  }, [dhartiTranslations.length])

  return (
    <h1 className="text-pretty text-4xl font-semibold tracking-tight md:text-6xl holo-glow">
      <div className="flex items-baseline">
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
          {/* Red underline only under Dharti */}
          <div 
            className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full"
            style={{ 
              background: 'linear-gradient(90deg, #ef4444, #dc2626)',
              boxShadow: '0 0 4px rgba(239, 68, 68, 0.5)'
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
      </div>
      <span className="text-sm md:text-base text-accent-foreground/70 font-medium tracking-wide uppercase">
        UPI for Land Ownership
      </span>
    </h1>
  )
}
