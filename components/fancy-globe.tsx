"use client"

import { useEffect, useRef } from "react"
import Globe from "globe.gl"
import { useSoundManager } from "@/components/sound-manager"

type GlobeApi = { flyTo: (lat: number, lng: number, durationMs?: number, done?: () => void) => void }

export default function FancyGlobe({ onReady, onApi }: { onReady?: () => void; onApi?: (api: GlobeApi) => void }) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const globeRef = useRef<any>(null)
  const rotationSoundRef = useRef<number | null>(null)
  const { playGlobeRotation, startTranquilMusic, stopTranquilMusic } = useSoundManager()

  useEffect(() => {
    if (!containerRef.current || globeRef.current) return

    const el = document.createElement("div")
    el.style.width = "100%"
    el.style.height = "100%"
    containerRef.current.appendChild(el)

    const globe = Globe({ animateIn: true })(el)
      .globeImageUrl("//unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
      .bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png")
      .backgroundColor("rgba(0,0,0,0)")
      .showAtmosphere(true)
      .atmosphereAltitude(0.25)
      .atmosphereColor("#6cf2ff")

    // starfield
    ;(globe as any).createStars?.(10000, 1.6)

    // auto rotate with sound
    const controls = (globe as any).controls()
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.65

    // Add rotation sound effect
    const createRotationSound = () => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        const filter = audioContext.createBiquadFilter()
        
        oscillator.connect(filter)
        filter.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.type = 'sine'
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime)
        
        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(400, audioContext.currentTime)
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime)
        gainNode.gain.linearRampToValueAtTime(0.02, audioContext.currentTime + 0.1)
        gainNode.gain.linearRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
        
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.5)
      } catch (error) {
        console.warn('Audio context not available:', error)
      }
    }

    // Start tranquil music when globe is ready
    startTranquilMusic()

    // Play rotation sound periodically
    const rotationInterval = setInterval(() => {
      playGlobeRotation()
    }, 5000)

    // initial view
    const renderer = (globe as any).renderer()
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))

    globe.width(containerRef.current.clientWidth)
    globe.height(containerRef.current.clientHeight)

    // holographic ring
    try {
      const scene = (globe as any).scene()
      const THREE = (globe as any).THREE
      const ringGeom = new THREE.RingGeometry(180, 182, 128)
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.12, side: THREE.DoubleSide })
      const ring = new THREE.Mesh(ringGeom, ringMat)
      ring.rotation.x = Math.PI / 2
      scene.add(ring)
    } catch {}

    globeRef.current = globe
    onApi?.({
      flyTo: (lat: number, lng: number, durationMs = 1400, done?: () => void) => {
        try {
          const current = (globeRef.current as any)?.pointOfView?.()
          const altitude = Math.max(0.18, current?.altitude ?? 0.3)
          ;(globeRef.current as any)?.pointOfView?.({ lat, lng, altitude }, durationMs)
          if (done) setTimeout(done, durationMs + 50)
        } catch {
          done?.()
        }
      },
    })
    onReady?.()

    const onResize = () => {
      if (!containerRef.current || !globeRef.current) return
      globeRef.current.width(containerRef.current.clientWidth)
      globeRef.current.height(containerRef.current.clientHeight)
    }
    window.addEventListener("resize", onResize)
    return () => {
      window.removeEventListener("resize", onResize)
      clearInterval(rotationInterval)
      stopTranquilMusic()
      try {
        containerRef.current?.replaceChildren()
      } catch {}
      globeRef.current = null
    }
  }, [onReady])

  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-lg border holo-border glass relative"
      aria-label="Interactive fancy globe"
      role="img"
    >
      <div className="pointer-events-none absolute inset-0 rounded-lg shadow-[0_0_24px_-8px_rgba(0,229,255,0.35)_inset]" />
    </div>
  )
}
