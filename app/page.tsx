'use client'

import { useState, useEffect } from 'react'
import { WalletProvider } from "@/contexts/wallet-context"
import MainPageContent from "@/components/main-page-content"
import SimpleKYC from "@/components/simple-kyc"

export default function Page() {
  const [showKYC, setShowKYC] = useState(false)
  const [showMain, setShowMain] = useState(false)

  useEffect(() => {
    // Check if KYC is already verified
    const isKYCVerified = localStorage.getItem('kyc_verified') === 'true'
    
    // For testing: Uncomment the line below to always show KYC
    // localStorage.removeItem('kyc_verified')
    
    if (isKYCVerified) {
      // Skip KYC, go directly to main page
      setShowKYC(false)
      setShowMain(true)
    } else {
      // Show KYC immediately
      setShowKYC(true)
    }
  }, [])

  const handleKYCComplete = () => {
    setShowKYC(false)
    setShowMain(true)
  }

  if (showKYC) {
    return <SimpleKYC onComplete={handleKYCComplete} />
  }

  if (showMain) {
    return (
      <WalletProvider>
        <MainPageContent />
      </WalletProvider>
    )
  }

  return null
}
