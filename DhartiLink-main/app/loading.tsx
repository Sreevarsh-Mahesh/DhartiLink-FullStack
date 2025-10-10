"use client"

import { useEffect, useMemo, useRef, useState } from "react"

const names = [
  { label: "DhartiLink", lang: "en" },
  { label: "धरतीलिंक", lang: "hi" },
  { label: "தர்திலிங்க்", lang: "ta" },
  { label: "ధర్తిలింక్", lang: "te" },
  { label: "DhartiLink", lang: "fr" },
  { label: "DhartiLink", lang: "es" },
]

export default function Loading() {
  const [idx, setIdx] = useState(0)
  const [blink, setBlink] = useState(false)
  const rafRef = useRef<number | null>(null)

  // starfield canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const stars = useMemo(() => Array.from({ length: 140 }, () => ({ x: Math.random(), y: Math.random(), z: Math.random() })), [])

  useEffect(() => {
    const loop = () => {
      const c = canvasRef.current
      if (!c) return
      const ctx = c.getContext("2d")
      if (!ctx) return
      const { width, height } = c
      ctx.clearRect(0, 0, width, height)
      // gradient background
      const g = ctx.createLinearGradient(0, 0, width, height)
      g.addColorStop(0, "#030712")
      g.addColorStop(1, "#0b1321")
      ctx.fillStyle = g
      ctx.fillRect(0, 0, width, height)
      // stars
      ctx.fillStyle = "rgba(108,242,255,0.9)"
      for (const s of stars) {
        s.z -= 0.0012
        if (s.z <= 0) s.z = 1
        const sx = (s.x - 0.5) * (width * (1 / s.z)) + width / 2
        const sy = (s.y - 0.5) * (height * (1 / s.z)) + height / 2
        const r = Math.max(0.5, 2.2 * (1 - s.z))
        ctx.beginPath()
        ctx.arc(sx, sy, r, 0, Math.PI * 2)
        ctx.fill()
      }
      rafRef.current = requestAnimationFrame(loop)
    }
    const resize = () => {
      if (!canvasRef.current) return
      canvasRef.current.width = window.innerWidth
      canvasRef.current.height = window.innerHeight
    }
    resize()
    rafRef.current = requestAnimationFrame(loop)
    window.addEventListener("resize", resize)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      window.removeEventListener("resize", resize)
    }
  }, [stars])

  useEffect(() => {
    const interval = setInterval(() => {
      setBlink(true)
      setTimeout(() => {
        setIdx((p) => (p + 1) % names.length)
        setBlink(false)
      }, 220)
    }, 1600)
    return () => clearInterval(interval)
  }, [])

  const current = names[idx]

  return (
    <div className="relative min-h-screen">
      <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true" />
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <div className="relative w-full max-w-3xl rounded-2xl border holo-border glass px-8 py-12 text-center">
          <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[0_0_48px_-12px_rgba(0,229,255,0.35)_inset]" />
          <div className="text-xs tracking-[0.35em] text-accent-foreground/80">INITIALIZING</div>
          <h1
            className={
              "mt-4 text-4xl font-semibold md:text-6xl holo-glow transition-opacity duration-200 " +
              (blink ? "opacity-0" : "opacity-100")
            }
          >
            {current.label}
          </h1>
          <p className="mt-2 text-xs text-muted-foreground">Preparing the hologram interface…</p>
          <div className="mx-auto mt-8 h-1 w-40 overflow-hidden rounded-full bg-secondary/30">
            <div className="h-full w-1/3 animate-[pulse_1.2s_ease-in-out_infinite] bg-primary/80" />
          </div>
        </div>
      </div>
    </div>
  )
}
