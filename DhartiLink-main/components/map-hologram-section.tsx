"use client"

import type React from "react"

import { useEffect, useMemo, useRef, useState } from "react"
import HologramPanel, { type Parcel } from "./hologram-panel"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Gavel } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import dynamic from "next/dynamic"
import { useSoundManager } from "@/components/sound-manager"

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyCVzTgaYCdrtau2c8WkVQSJjaruwjqDu1k"

// Debug: Log the API key status
if (typeof window !== 'undefined') {
  console.log('Google Maps API Key:', GOOGLE_MAPS_API_KEY ? 'Configured' : 'Not configured')
}

declare global {
  interface Window {
    __gmapsPromise?: Promise<any>
    google?: any
    __gmapsInit?: () => void
  }
}

function loadGoogleMaps(): Promise<any> {
  if (typeof window === "undefined") return Promise.reject(new Error("Not in browser"))
  if (window.google?.maps) return Promise.resolve(window.google.maps)
  if (window.__gmapsPromise) return window.__gmapsPromise

  // Check if API key is available
  if (!GOOGLE_MAPS_API_KEY) {
    return Promise.reject(new Error("Google Maps API key not configured"))
  }

  window.__gmapsPromise = new Promise((resolve, reject) => {
    const id = "google-maps-js"
    if (document.getElementById(id)) {
      const check = () => (window.google?.maps ? resolve(window.google.maps) : setTimeout(check, 50))
      return check()
    }
    const script = document.createElement("script")
    script.id = id
    script.async = true
    script.defer = true
    script.crossOrigin = "anonymous"
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&v=weekly&libraries=places,geometry&callback=__gmapsInit`
    window.__gmapsInit = () => resolve(window.google.maps)
    script.onerror = () => reject(new Error("Failed to load Google Maps JS API"))
    document.head.appendChild(script)
  })

  return window.__gmapsPromise
}

type FeatureRecord = {
  path: { lat: number; lng: number }[]
  properties: Parcel
}

export default function MapHologramSection() {
  const mapRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const sectionRef = useRef<HTMLElement | null>(null)
  const attachedElRef = useRef<HTMLInputElement | null>(null)
  
  const {
    playMapSearch,
    playMapZoom,
    playParcelSelect,
    playHover,
    playButtonClick,
    playInputFocus,
  } = useSoundManager()

  const ownerRef = useRef<HTMLInputElement | null>(null)
  const addrRef = useRef<HTMLInputElement | null>(null)
  const parcelRef = useRef<HTMLInputElement | null>(null)
  const autocompleteRef = useRef<any>(null)
  const placeResultRef = useRef<any>(null)

  const [selected, setSelected] = useState<Parcel | null>(null)
  const [visible, setVisible] = useState(false)
  const [hasQuery, setHasQuery] = useState(false)
  const [query, setQuery] = useState<string>("")
  const [searchError, setSearchError] = useState<string | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const [mapsError, setMapsError] = useState<string | null>(null)
  const FancyGlobe = useMemo(() => dynamic(() => import("./fancy-globe"), { ssr: false }), [])
  const globeApiRef = useRef<{ flyTo: (lat: number, lng: number, durationMs?: number, done?: () => void) => void } | null>(null)

  // Will be used by effects to act after map init
  const [searchResult, setSearchResult] = useState<{
    targetLatLng?: { lat: number; lng: number }
    parcelId?: string
  } | null>(null)

  const mapStyles = useMemo(
    () => [
      { elementType: "geometry", stylers: [{ color: "#0b0f14" }] },
      { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
      { elementType: "labels.text.fill", stylers: [{ color: "#8ea2ad" }] },
      { elementType: "labels.text.stroke", stylers: [{ color: "#0b0f14" }] },
      { featureType: "poi", stylers: [{ visibility: "off" }] },
      { featureType: "transit", stylers: [{ visibility: "off" }] },
      { featureType: "road", elementType: "geometry", stylers: [{ color: "#141a22" }] },
      { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
      { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e1621" }] },
      { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#1a2330" }] },
    ],
    [],
  )

  // Dummy parcel data
  const geojson = useMemo<FeatureRecord[]>(() => {
    const base = { lat: 12.9716, lng: 77.5946 }
    const square = (dx: number, dy: number, size = 0.002) => [
      { lat: base.lat + dy, lng: base.lng + dx },
      { lat: base.lat + dy, lng: base.lng + dx + size },
      { lat: base.lat + dy + size, lng: base.lng + dx + size },
      { lat: base.lat + dy + size, lng: base.lng + dx },
    ]
    const mk = (id: string, owner: string, dx: number, dy: number, areaSqM: number): FeatureRecord => ({
      path: square(dx, dy),
      properties: {
        id,
        owner,
        areaSqM,
        jurisdiction: "BBMP · Karnataka",
        encumbrances: id.endsWith("2") ? ["Bank Lien: KBL-2024-19"] : [],
        chainAssetId: `parcel:${id}:l2-rollup-01`,
        docDigest: `0x${btoa(id).slice(0, 6)}…${btoa(owner).slice(-6)}`,
      },
    })

    const features: FeatureRecord[] = []
    // Seed a few hand-placed parcels
    features.push(
      mk("KA-BLR-1001", "Anita Rao", 0.0, 0.0, 980),
      mk("KA-BLR-1002", "Rahul Singh", 0.004, 0.003, 1125),
      mk("KA-BLR-1003", "Lalita Mehta", -0.004, -0.0035, 870),
    )

    // Deterministic grid of parcels around the base (up to ~50 total)
    const ownerNames = [
      "Arjun Rao", "Meera Nair", "Kiran Reddy", "Priya Sharma", "Vikas Gupta",
      "Ananya Sharma", "Rohit Kumar", "Neha Verma", "Sanjay Mehta", "Dhruv Shah",
      "Pooja Jain", "Harpreet Singh", "Amit Patel", "Rajesh Kumar", "Lalita Mehta",
      "Imran Khan", "Tanya Malik", "Kabir Thakur", "Ritika Kapoor", "Shalini Joshi",
    ]

    // Generate KA-BLR-1004 .. KA-BLR-1050
    for (let idx = 1004; idx <= 1050; idx++) {
      const i = idx - 1000 // 4..50
      const gx = (i % 10) - 5 // -5..4
      const gy = Math.floor(i / 10) - 2 // -2..3
      const dx = gx * 0.004
      const dy = gy * 0.0035
      const areaSqM = 800 + ((i * 37) % 600) // 800..1399
      const owner = ownerNames[(i + 3) % ownerNames.length]
      features.push(mk(`KA-BLR-${idx}`, owner, dx, dy, areaSqM))
    }

    // --- Chennai cluster (TN-CHN) ---
    // Center near Chennai and push ~20 parcels around it
    const chennaiBase = { lat: 13.0827, lng: 80.2707 }
    const chSquare = (dx: number, dy: number, size = 0.002) => [
      { lat: chennaiBase.lat + dy, lng: chennaiBase.lng + dx },
      { lat: chennaiBase.lat + dy, lng: chennaiBase.lng + dx + size },
      { lat: chennaiBase.lat + dy + size, lng: chennaiBase.lng + dx + size },
      { lat: chennaiBase.lat + dy + size, lng: chennaiBase.lng + dx },
    ]
    const mkCh = (id: string, owner: string, dx: number, dy: number, areaSqM: number): FeatureRecord => ({
      path: chSquare(dx, dy),
      properties: {
        id,
        owner,
        areaSqM,
        jurisdiction: "Greater Chennai · Tamil Nadu",
        encumbrances: id.endsWith("7") ? ["Encumbrance: EC-2024-07"] : [],
        chainAssetId: `parcel:${id}:l2-rollup-01`,
        docDigest: `0x${btoa(id).slice(0, 6)}…${btoa(owner).slice(-6)}`,
      },
    })

    const chOwners = [
      "S. Karthik",
      "P. Lakshmi",
      "R. Srinivasan",
      "A. Priyanka",
      "V. Bharath",
      "N. Keerthana",
      "M. Aravind",
      "T. Divya",
      "G. Prakash",
      "K. Nithya",
      "D. Vignesh",
      "S. Sandhya",
      "R. Harish",
      "A. Meenakshi",
      "V. Sanjay",
      "K. Gayathri",
      "M. Naveen",
      "P. Anitha",
      "S. Dinesh",
      "R. Kavya",
    ]

    let chIdx = 2001
    const chGrid: Array<{ gx: number; gy: number }> = [
      { gx: -3, gy: -2 },
      { gx: -1, gy: -2 },
      { gx: 1, gy: -2 },
      { gx: 3, gy: -2 },
      { gx: -4, gy: -1 },
      { gx: -2, gy: -1 },
      { gx: 0, gy: -1 },
      { gx: 2, gy: -1 },
      { gx: 4, gy: -1 },
      { gx: -3, gy: 0 },
      { gx: -1, gy: 0 },
      { gx: 1, gy: 0 },
      { gx: 3, gy: 0 },
      { gx: -4, gy: 1 },
      { gx: -2, gy: 1 },
      { gx: 0, gy: 1 },
      { gx: 2, gy: 1 },
      { gx: 4, gy: 1 },
      { gx: -1, gy: 2 },
      { gx: 1, gy: 2 },
    ]
    chGrid.forEach((g, i) => {
      const dx = g.gx * 0.004
      const dy = g.gy * 0.0035
      const areaSqM = 900 + ((i * 53) % 700)
      const owner = chOwners[i % chOwners.length]
      features.push(mkCh(`TN-CHN-${chIdx++}`, owner, dx, dy, areaSqM))
    })

    return features
  }, [])

  // Initialize Places Autocomplete on the address input
  useEffect(() => {
    const init = async () => {
      try {
        await loadGoogleMaps()
        const inputEl = addrRef.current
        if (inputEl && inputEl !== attachedElRef.current && window.google?.maps?.places) {
          // Recreate Autocomplete on the current input element
          const ac = new window.google.maps.places.Autocomplete(inputEl, {
            fields: ["geometry", "formatted_address", "name"],
            types: ["geocode"],
          })
          autocompleteRef.current = ac
          placeResultRef.current = null
          ac.addListener("place_changed", () => {
            try {
              const place = ac.getPlace?.()
              placeResultRef.current = place || null
            } catch {
              placeResultRef.current = null
            }
          })
          attachedElRef.current = inputEl
        }
      } catch (e) {
        console.error("[v0] Autocomplete init error:", (e as Error).message)
      }
    }
    init()
  }, [hasQuery])

  // Listen for portfolio land search events
  useEffect(() => {
    const handlePortfolioLandSearch = async (event: CustomEvent) => {
      const { location, title } = event.detail
      setQuery(location)
      setHasQuery(true)
      playMapSearch()
      
      // Set the address input value and trigger search
      if (addrRef.current) {
        addrRef.current.value = location
      }
      
      // Trigger the search programmatically
      try {
        const maps = await loadGoogleMaps()
        const geocoder = new maps.Geocoder()
        const resp = await geocoder.geocode({ address: location })
        const best = resp?.results?.[0]
        if (best?.geometry?.location) {
          const loc = best.geometry.location
          setSearchResult({
            targetLatLng: { lat: loc.lat(), lng: loc.lng() }
          })
        }
      } catch (geoErr) {
        console.warn("[v0] Portfolio geocoding failed:", (geoErr as Error).message)
        // Don't set hasQuery to true if geocoding fails
        setHasQuery(false)
        setQuery("")
      }
    }

    window.addEventListener('portfolioLandSearch', handlePortfolioLandSearch as EventListener)
    
    return () => {
      window.removeEventListener('portfolioLandSearch', handlePortfolioLandSearch as EventListener)
    }
  }, [playMapSearch])

  // Initialize Google Map once the user has searched (container exists then)
  useEffect(() => {
    if (!hasQuery || !containerRef.current || mapRef.current) return
    
    // Ensure the container is properly mounted
    if (!containerRef.current || !containerRef.current.offsetParent) {
      console.warn("[v0] Map container not properly mounted")
      return
    }
    
    // Add a small delay to ensure the container is fully rendered
    const initMap = async () => {
      // Double-check the container is still available
      if (!containerRef.current) {
        console.warn("[v0] Map container disappeared during initialization")
        return
      }
      
      let maps: any
      try {
        maps = await loadGoogleMaps()
        setMapsError(null)
        const theme = getComputedStyle(document.documentElement)
        const primary = theme.getPropertyValue("--color-primary")?.trim() || "#00e5ff"
        const accent = theme.getPropertyValue("--color-chart-2")?.trim() || "#ff3fd8"

        if (!containerRef.current) {
          console.warn("[v0] Map container not ready")
          return
        }
        
        const map = new maps.Map(containerRef.current, {
          center: { lat: 20, lng: 0 },
          zoom: 2,
          disableDefaultUI: true,
          clickableIcons: false,
          styles: mapStyles as any,
          gestureHandling: "greedy",
          mapTypeControl: false,
          tilt: 0,
          heading: 0,
        })
        mapRef.current = map
        containerRef.current!.style.boxShadow =
          "0 0 24px -8px rgba(0, 229, 255, 0.35), inset 0 0 0 1px rgba(0, 229, 255, 0.25)"

        // Subtle animated glow on idle
        try {
          const overlay = new maps.Circle({
            center: { lat: 20, lng: 0 },
            radius: 2_000_000,
            strokeColor: accent,
            strokeOpacity: 0.15,
            strokeWeight: 1,
            fillColor: primary,
            fillOpacity: 0.05,
            map,
          })
          setTimeout(() => overlay.setMap(null), 2500)
        } catch {}

        setMapReady(true)
      } catch (err) {
        console.error("[v0] Google Maps globe init error:", (err as Error).message)
        const errorMessage = (err as Error).message
        
        if (errorMessage.includes('BillingNotEnabledMapError')) {
          setMapsError("Google Maps billing is not enabled. Please enable billing in your Google Cloud Console to use the Maps API.")
        } else if (errorMessage.includes('RefererNotAllowedMapError')) {
          setMapsError("This domain is not authorized to use the Google Maps API. Please add localhost:3000 to your allowed referrers.")
        } else if (errorMessage.includes('API key not configured')) {
          setMapsError("Google Maps API key is not configured. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your .env.local file.")
        } else {
          setMapsError("Google Maps is not available. Please check your API key configuration and billing settings.")
        }
      }
    }
    
    // Add a small delay to ensure the container is fully rendered
    setTimeout(initMap, 100)
  }, [hasQuery])

  useEffect(() => {
    if (!mapReady || !hasQuery || !mapRef.current) return
    let polygons: any[] = []
    let maps = window.google?.maps
    try {
      const theme = getComputedStyle(document.documentElement)
      const primary = theme.getPropertyValue("--color-primary")?.trim() || "#00e5ff"
      const accent = theme.getPropertyValue("--color-chart-2")?.trim() || "#ff3fd8"
      const map = mapRef.current

      const setCursor = (v: string) => {
        if (containerRef.current) containerRef.current.style.cursor = v
      }

      polygons = geojson.map((feature) => {
        const poly = new maps.Polygon({
          paths: feature.path,
          strokeColor: accent,
          strokeOpacity: 0.85,
          strokeWeight: 2,
          fillColor: primary,
          fillOpacity: 0.18,
          map,
        })

        poly.addListener("mouseover", () => {
          setCursor("pointer")
          setSelected({ ...feature.properties })
          poly.setOptions({ fillOpacity: 0.26, strokeWeight: 3 })
        })
        poly.addListener("mouseout", () => {
          setCursor("")
          poly.setOptions({ fillOpacity: 0.18, strokeWeight: 2 })
        })
        poly.addListener("click", () => setVisible(true))
        ;(poly as any).__parcelId = feature.properties.id
        return poly
      })

      const flyToBounds = (bounds: any) => {
        map.fitBounds(bounds, 48)
        setTimeout(() => {
          // Add cinematic tilt/heading
          try {
            map.setTilt(67.5)
            map.setHeading(35)
          } catch {}
        }, 450)
      }

      const pulseAt = (lat: number, lng: number) => {
        try {
          const marker = new maps.Marker({ position: { lat, lng }, map, animation: maps.Animation.DROP })
          const circle = new maps.Circle({
            center: { lat, lng },
            radius: 30,
            strokeColor: accent,
            strokeOpacity: 0.6,
            strokeWeight: 1,
            fillColor: accent,
            fillOpacity: 0.15,
            map,
          })
          setTimeout(() => circle.setOptions({ radius: 120, fillOpacity: 0.05, strokeOpacity: 0.25 }), 400)
          setTimeout(() => {
            circle.setMap(null)
            marker.setMap(null)
          }, 2000)
        } catch {}
      }

      if (searchResult?.parcelId) {
        const target = geojson.find((g) => g.properties.id === searchResult.parcelId)
        if (target) {
          const bounds = new maps.LatLngBounds()
          for (const p of target.path) bounds.extend(p)
          flyToBounds(bounds)
          setSelected(target.properties)
          setVisible(true)
          const centroid = target.path.reduce(
            (acc, p) => ({ lat: acc.lat + p.lat / target.path.length, lng: acc.lng + p.lng / target.path.length }),
            { lat: 0, lng: 0 },
          )
          pulseAt(centroid.lat, centroid.lng)
        }
      } else if (searchResult?.targetLatLng && window.google?.maps?.geometry?.poly) {
        const point = new maps.LatLng(searchResult.targetLatLng)
        const maybe = polygons.find((poly) => window.google.maps.geometry.poly.containsLocation(point, poly))
        if (maybe) {
          const id = (maybe as any).__parcelId as string
          const target = geojson.find((g) => g.properties.id === id)
          if (target) {
            const bounds = new maps.LatLngBounds()
            for (const p of target.path) bounds.extend(p)
            flyToBounds(bounds)
            setSelected(target.properties)
            setVisible(true)
          }
        } else {
          map.setCenter(searchResult.targetLatLng)
          map.setZoom(16)
        }
      }

      return () => {
        try {
          ;(polygons || []).forEach((p) => p.setMap && p.setMap(null))
        } catch {}
      }
    } catch (err) {
      console.error("[v0] parcel overlay error:", (err as Error).message)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, hasQuery])

  // IntersectionObserver still controls the hologram reveal effect
  useEffect(() => {
    if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") return
    const el = sectionRef.current
    if (!el || !(el instanceof Element)) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) setVisible(e.isIntersecting)
      },
      { threshold: 0.2 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault?.()
    playMapSearch()
    setSearchError(null)
    const owner = ownerRef.current?.value?.trim() || ""
    const addr = addrRef.current?.value?.trim() || ""
    const parcel = parcelRef.current?.value?.trim() || ""

    const findByParcel =
      parcel && geojson.find((g) => g.properties.id.toLowerCase().includes(parcel.toLowerCase()))?.properties.id

    const findByOwner =
      !findByParcel &&
      owner &&
      geojson.find((g) => g.properties.owner.toLowerCase().includes(owner.toLowerCase()))?.properties.id

    let targetLatLng: { lat: number; lng: number } | undefined
    const parcelId: string | undefined = findByParcel || findByOwner || undefined

    try {
      const maps = await loadGoogleMaps()

      // Prefer Autocomplete selection if any
      if (!parcelId) {
        const place = placeResultRef.current
        if (place?.geometry?.location) {
          const loc = place.geometry.location
          targetLatLng = { lat: loc.lat(), lng: loc.lng() }
        } else if (addr) {
          try {
            const geocoder = new maps.Geocoder()
            const resp = await geocoder.geocode({ address: addr })
            const best = resp?.results?.[0]
            if (best?.geometry?.location) {
              const loc = best.geometry.location
              targetLatLng = { lat: loc.lat(), lng: loc.lng() }
            }
          } catch (geoErr) {
            console.warn("[v0] Geocoding failed:", (geoErr as Error).message)
          }
        }
      }

      if (!parcelId && !targetLatLng) {
        setSearchError("Enter at least Parcel ID, Owner name, or a valid Address.")
        return
      }

      // If we have a target position, animate globe first, then switch to map
      const endLatLng = targetLatLng || (() => {
        const byId = (parcelId && geojson.find((g) => g.properties.id === parcelId)) || null
        if (!byId) return undefined
        const c = byId.path.reduce(
          (acc, p) => ({ lat: acc.lat + p.lat / byId.path.length, lng: acc.lng + p.lng / byId.path.length }),
          { lat: 0, lng: 0 },
        )
        return c
      })()

      if (!hasQuery && endLatLng && globeApiRef.current) {
        globeApiRef.current.flyTo(endLatLng.lat, endLatLng.lng, 1400, () => {
          setSearchResult({ parcelId, targetLatLng })
          setHasQuery(true)
          setTimeout(() => setVisible(true), 50)
        })
      } else {
        setSearchResult({ parcelId, targetLatLng })
        setHasQuery(true)
        setTimeout(() => setVisible(true), 50)
      }
    } catch (err) {
      console.error("[v0] Search error:", (err as Error).message)
      setSearchError("Search failed. Please try again.")
    }
  }

  return (
    <section id="holo-section" ref={sectionRef} className="relative">
      <div className="holo-grid pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />

      {/* Pre-map large search form (globe showing behind) */}
      {!hasQuery && (
        <div className="mx-auto max-w-4xl px-6 py-10 md:py-14">
          <div className="glass holo-border scanlines rounded-lg p-6">
            <h2 className="text-balance text-2xl font-semibold holo-glow">DhartiLink Parcel Search</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Provide any one: Parcel ID, Owner name, or Address/Area. We’ll locate the parcel and reveal its hologram.
            </p>
            <form onSubmit={handleSearch} className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="parcel">Parcel ID</Label>
                <Input 
                  ref={parcelRef} 
                  id="parcel" 
                  placeholder="KA-BLR-1002" 
                  className="holo-border" 
                  onFocus={playInputFocus}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="owner">Owner Name</Label>
                <Input 
                  ref={ownerRef} 
                  id="owner" 
                  placeholder="e.g., Rahul" 
                  className="holo-border" 
                  onFocus={playInputFocus}
                />
              </div>
              <div className="flex flex-col gap-2 md:col-span-1">
                <Label htmlFor="address">Address / Area</Label>
                <Input
                  ref={addrRef}
                  id="address"
                  placeholder="Enter address or area"
                  className="holo-border"
                  aria-autocomplete="list"
                  onFocus={playInputFocus}
                />
              </div>
              <div className="md:col-span-3 flex justify-end pt-2">
                <Button 
                  type="submit" 
                  className="holo-glow"
                  onMouseEnter={playHover}
                  onClick={playButtonClick}
                >
                  Search
                </Button>
              </div>
              {searchError && <div className="md:col-span-3 text-sm text-destructive-foreground/90">{searchError}</div>}
            </form>
          </div>
        </div>
      )}

      {/* After search: compact sticky searchbar over the map */}
      {hasQuery && (
        <div className="sticky top-0 z-10 mx-auto w-full max-w-7xl px-4 pt-4">
          <form
            onSubmit={handleSearch}
            className="glass holo-border scanlines rounded-lg p-3 grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_1fr_auto]"
            role="search"
            aria-label="Search for land parcel"
          >
            <Input ref={parcelRef} placeholder="Parcel ID" className="holo-border" />
            <Input ref={ownerRef} placeholder="Owner Name" className="holo-border" />
            <Input ref={addrRef} placeholder="Address / Area" className="holo-border" aria-autocomplete="list" />
            <Button type="submit" className="holo-glow">
              Search
            </Button>
            {searchError && <div className="md:col-span-4 text-xs text-destructive-foreground/90">{searchError}</div>}
          </form>
        </div>
      )}

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[minmax(0,1fr)_380px] md:py-10">
        <div className="relative">
          {/* Left: render either globe or map for consistent layout */}
          {!hasQuery ? (
            <div className="h-[52vh] sm:h-[56vh] md:h-[70vh] w-full overflow-hidden rounded-lg border holo-border glass">
              <FancyGlobe onApi={(api) => (globeApiRef.current = api)} />
            </div>
          ) : mapsError ? (
            <div className="h-[56vh] md:h-[70vh] w-full overflow-hidden rounded-lg border holo-border glass flex items-center justify-center p-8">
              <div className="text-center space-y-4">
                <div className="text-6xl">🗺️</div>
                <h3 className="text-xl font-semibold text-blue-50">Google Maps Not Available</h3>
                <p className="text-gray-400 max-w-md">
                  {mapsError}
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <p>To fix this issue:</p>
                  <ol className="list-decimal list-inside space-y-1 text-left">
                    <li>Go to <a href="https://console.cloud.google.com/billing" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Google Cloud Console Billing</a></li>
                    <li>Enable billing for your project</li>
                    <li>Add a payment method (Google provides $200 free credits)</li>
                    <li>Return to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">API Credentials</a></li>
                    <li>Add localhost:3000 to allowed referrers</li>
                  </ol>
                  <p className="text-xs text-gray-600 mt-2">
                    💡 <strong>Note:</strong> Google Maps API requires billing to be enabled, even for development use.
                  </p>
                </div>
                <Button 
                  onClick={() => {
                    setHasQuery(false)
                    setMapsError(null)
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Back to Globe
                </Button>
              </div>
            </div>
          ) : (
            <div
              ref={containerRef as any}
              className="h-[56vh] md:h-[70vh] w-full overflow-hidden rounded-lg border holo-border glass"
              aria-label="Interactive land parcels map"
              role="region"
            />
          )}
        </div>

        <div className="flex flex-col gap-4">
          <HologramPanel parcel={selected} visible={visible} />
          <div className="glass holo-border p-4">
            <p className="text-xs leading-relaxed text-muted-foreground">
              {hasQuery ? 'Hover parcels to preview details. Click to pin.' : 'Provide details to reveal parcels over the map.'}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                className="holo-glow w-full justify-center whitespace-nowrap"
                aria-label="Start mock verification"
              >
                Verify Ownership (Demo)
              </Button>
              <Button
                variant="secondary"
                className="holo-glow w-full justify-center whitespace-nowrap"
                aria-label="Start mock bidding"
              >
                <Gavel className="mr-2 h-4 w-4 shrink-0" />
                Open Bidding (Demo)
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
