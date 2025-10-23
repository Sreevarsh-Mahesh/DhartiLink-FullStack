"use client"

import { useEffect, useRef } from "react"

export const useSoundManager = () => {
  const audioContextRef = useRef<AudioContext | null>(null)
  const tranquilMusicRef = useRef<AudioBufferSourceNode | null>(null)

  const createSound = (frequency: number, duration: number, volume: number = 0.1, type: OscillatorType = 'sine', filterFreq?: number) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      
      const oscillator = audioContextRef.current.createOscillator()
      const gainNode = audioContextRef.current.createGain()
      const filter = audioContextRef.current.createBiquadFilter()
      
      oscillator.connect(filter)
      filter.connect(gainNode)
      gainNode.connect(audioContextRef.current.destination)
      
      oscillator.type = type
      oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime)
      
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(filterFreq || frequency * 2, audioContextRef.current.currentTime)
      
      gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime)
      gainNode.gain.linearRampToValueAtTime(volume, audioContextRef.current.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration)
      
      oscillator.start(audioContextRef.current.currentTime)
      oscillator.stop(audioContextRef.current.currentTime + duration)
    } catch (error) {
      console.warn('Audio context not available:', error)
    }
  }

  // Basic interaction sounds
  const playButtonClick = () => {
    createSound(800, 0.2, 0.05, 'sine', 1200)
  }

  const playHover = () => {
    createSound(600, 0.15, 0.03, 'sine', 1000)
  }

  const playTabSwitch = () => {
    createSound(700, 0.25, 0.06, 'sine', 1400)
  }

  const playCardHover = () => {
    createSound(500, 0.3, 0.04, 'sine', 800)
  }

  // Wallet sounds
  const playWalletConnect = () => {
    // Success sound - ascending chord
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      
      const frequencies = [400, 500, 600, 800]
      frequencies.forEach((freq, index) => {
        setTimeout(() => {
          createSound(freq, 0.3, 0.08, 'sine', freq * 1.5)
        }, index * 50)
      })
    } catch (error) {
      console.warn('Audio context not available:', error)
    }
  }

  const playWalletDisconnect = () => {
    createSound(1000, 0.4, 0.06, 'sine', 1500)
  }

  // Map and globe sounds
  const playGlobeRotation = () => {
    createSound(200, 0.5, 0.02, 'sine', 400)
  }

  const playMapZoom = () => {
    createSound(300, 0.6, 0.05, 'sine', 600)
  }

  const playMapSearch = () => {
    createSound(400, 0.3, 0.04, 'sine', 800)
  }

  const playParcelSelect = () => {
    createSound(600, 0.2, 0.05, 'sine', 1000)
  }

  // Loading and transition sounds
  const playLoadingStart = () => {
    createSound(800, 0.4, 0.06, 'sine', 1200)
  }

  const playLoadingComplete = () => {
    createSound(1000, 0.5, 0.08, 'sine', 1500)
  }

  const playLanguageChange = () => {
    createSound(500, 0.2, 0.03, 'sine', 800)
  }

  // Form and input sounds
  const playInputFocus = () => {
    createSound(600, 0.15, 0.03, 'sine', 1000)
  }

  const playInputType = () => {
    createSound(400, 0.1, 0.02, 'sine', 600)
  }

  const playFormSubmit = () => {
    createSound(700, 0.3, 0.05, 'sine', 1200)
  }

  // Error and success sounds
  const playError = () => {
    createSound(200, 0.4, 0.06, 'sine', 400)
  }

  const playSuccess = () => {
    createSound(800, 0.3, 0.05, 'sine', 1200)
  }

  // Holographic ambient sounds
  const playHoloAmbient = () => {
    createSound(300, 1.0, 0.02, 'sine', 500)
  }

  const playHoloScan = () => {
    createSound(400, 0.8, 0.04, 'sine', 800)
  }

  const playHoloBeep = () => {
    createSound(1000, 0.1, 0.03, 'sine', 1500)
  }

  const startTranquilMusic = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      
      if (tranquilMusicRef.current) {
        tranquilMusicRef.current.stop()
      }

      const oscillator = audioContextRef.current.createOscillator()
      const gainNode = audioContextRef.current.createGain()
      const filter = audioContextRef.current.createBiquadFilter()
      
      oscillator.connect(filter)
      filter.connect(gainNode)
      gainNode.connect(audioContextRef.current.destination)
      
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(220, audioContextRef.current.currentTime)
      
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(400, audioContextRef.current.currentTime)
      
      gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.01, audioContextRef.current.currentTime + 2)
      
      oscillator.start(audioContextRef.current.currentTime)
      tranquilMusicRef.current = oscillator
    } catch (error) {
      console.warn('Audio context not available:', error)
    }
  }

  const stopTranquilMusic = () => {
    if (tranquilMusicRef.current) {
      tranquilMusicRef.current.stop()
      tranquilMusicRef.current = null
    }
  }

  useEffect(() => {
    return () => {
      stopTranquilMusic()
    }
  }, [])

  return {
    // Basic interactions
    playButtonClick,
    playHover,
    playTabSwitch,
    playCardHover,
    
    // Wallet sounds
    playWalletConnect,
    playWalletDisconnect,
    
    // Map and globe sounds
    playGlobeRotation,
    playMapZoom,
    playMapSearch,
    playParcelSelect,
    
    // Loading and transitions
    playLoadingStart,
    playLoadingComplete,
    playLanguageChange,
    
    // Form sounds
    playInputFocus,
    playInputType,
    playFormSubmit,
    
    // Status sounds
    playError,
    playSuccess,
    
    // Holographic sounds
    playHoloAmbient,
    playHoloScan,
    playHoloBeep,
    
    // Music
    startTranquilMusic,
    stopTranquilMusic
  }
}
