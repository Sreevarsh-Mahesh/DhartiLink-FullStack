'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface PurchasedLand {
  id: string
  title: string
  description: string
  price: string
  area: string
  location: string
  seller: string
  sellerName: string
  purchaseDate: string
  imageUrl?: string
}

interface PurchasedLandsContextType {
  purchasedLands: PurchasedLand[]
  addPurchasedLand: (land: PurchasedLand) => void
  removePurchasedLand: (landId: string) => void
  isLandPurchased: (landId: string) => boolean
}

const PurchasedLandsContext = createContext<PurchasedLandsContextType | undefined>(undefined)

export function PurchasedLandsProvider({ children }: { children: React.ReactNode }) {
  const [purchasedLands, setPurchasedLands] = useState<PurchasedLand[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('purchasedLands')
    if (stored) {
      try {
        setPurchasedLands(JSON.parse(stored))
      } catch (error) {
        console.error('Error loading purchased lands:', error)
      }
    }
  }, [])

  // Save to localStorage whenever purchasedLands changes
  useEffect(() => {
    localStorage.setItem('purchasedLands', JSON.stringify(purchasedLands))
  }, [purchasedLands])

  const addPurchasedLand = (land: PurchasedLand) => {
    setPurchasedLands(prev => {
      // Check if land is already purchased
      if (prev.some(p => p.id === land.id)) {
        return prev
      }
      return [...prev, land]
    })
  }

  const removePurchasedLand = (landId: string) => {
    setPurchasedLands(prev => prev.filter(land => land.id !== landId))
  }

  const isLandPurchased = (landId: string) => {
    return purchasedLands.some(land => land.id === landId)
  }

  return (
    <PurchasedLandsContext.Provider value={{
      purchasedLands,
      addPurchasedLand,
      removePurchasedLand,
      isLandPurchased
    }}>
      {children}
    </PurchasedLandsContext.Provider>
  )
}

export function usePurchasedLands() {
  const context = useContext(PurchasedLandsContext)
  if (context === undefined) {
    throw new Error('usePurchasedLands must be used within a PurchasedLandsProvider')
  }
  return context
}
