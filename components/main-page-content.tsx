'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import MapHologramSection from "@/components/map-hologram-section"
import PortfolioMapSection from "@/components/portfolio-map-section"
import { WalletConnect } from "@/components/wallet-connect"
import { LandVerification } from "@/components/land-verification"
import { LandMarketplace } from "@/components/land-marketplace"
import LandMarketplaceEnhanced from "@/components/land-marketplace-enhanced"
import { ClientOnly } from "@/components/client-only"
import TitleTransition from "@/components/title-transition"
import { Wallet, Shield, ShoppingCart, Map, Briefcase } from "lucide-react"
import { useSoundManager } from "@/components/sound-manager"
import { usePurchasedLands } from "@/contexts/purchased-lands-context"
import { useWalletContext } from "@/contexts/wallet-context"

export default function MainPageContent() {
  const { playTabSwitch, playCardHover, playButtonClick } = useSoundManager()
  const { purchasedLands } = usePurchasedLands()
  const { account, erupeeBalance } = useWalletContext()
  const [isVisible, setIsVisible] = useState(false)
  const [isKYCVerified, setIsKYCVerified] = useState(false)

  useEffect(() => {
    // Check KYC status
    const kycVerified = localStorage.getItem('kyc_verified') === 'true'
    setIsKYCVerified(kycVerified)
  }, [])

  useEffect(() => {
    // Fade in the main content after a short delay
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 500)
    
    return () => clearTimeout(timer)
  }, [])

  return (
    <main className={`min-h-screen bg-black transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Reset KYC Button - Only in Main Page */}
      <button 
        onClick={() => {
          localStorage.removeItem('kyc_verified')
          window.location.reload()
        }}
        className="fixed top-4 right-4 z-50 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
      >
        Reset KYC
      </button>
      
      <header className="relative overflow-hidden">
        <div className="holo-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
        <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="flex flex-col items-start gap-6">
            <p className="text-xs tracking-[0.35em] text-accent-foreground/80">INTRODUCING</p>
            <div className="relative">
              <TitleTransition />
            </div>
            
            {/* KYC Status Badge */}
            {isKYCVerified && (
              <div className="flex items-center space-x-2">
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 flex items-center space-x-1">
                  <Shield className="w-3 h-3" />
                  <span>KYC Verified</span>
                </Badge>
              </div>
            )}
            
            {/* ERupeeDummy Balance Display */}
            {account && erupeeBalance && (
              <div className="flex items-center space-x-2">
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 flex items-center space-x-1">
                  <span className="font-mono text-lg">₹{parseFloat(erupeeBalance).toFixed(2)}</span>
                  <span className="text-sm">ERupee</span>
                </Badge>
              </div>
            )}
            
            <p className="text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
              Instant ownership verification, transparent transfers, and open digital bidding—powered by blockchain,
              geospatial mapping, and digitized records for India's land economy.
            </p>
            <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
              <Card className="glass holo-border" onMouseEnter={playCardHover}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-primary">On-chain Proofs</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Document digests and ownership events anchored on-chain.
                </CardContent>
              </Card>
              <Card className="glass holo-border" onMouseEnter={playCardHover}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-primary">Geo-Linked Records</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Parcels, lineage, and encumbrances mapped to authoritative geometry.
                </CardContent>
              </Card>
              <Card className="glass holo-border" onMouseEnter={playCardHover}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-primary">Open Bidding</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Transparent auctions with settlement finality.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <Tabs defaultValue="wallet" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger 
              value="wallet" 
              className="flex items-center gap-2"
              onMouseEnter={playTabSwitch}
            >
              <Wallet className="h-4 w-4" />
              Wallet
            </TabsTrigger>
            <TabsTrigger 
              value="verification" 
              className="flex items-center gap-2"
              onMouseEnter={playTabSwitch}
            >
              <Shield className="h-4 w-4" />
              Verification
            </TabsTrigger>
            <TabsTrigger 
              value="marketplace" 
              className="flex items-center gap-2"
              onMouseEnter={playTabSwitch}
            >
              <ShoppingCart className="h-4 w-4" />
              Marketplace
            </TabsTrigger>
            <TabsTrigger 
              value="map" 
              className="flex items-center gap-2"
              onMouseEnter={playTabSwitch}
            >
              <Map className="h-4 w-4" />
              Map
            </TabsTrigger>
            <TabsTrigger 
              value="portfolio" 
              className="flex items-center gap-2"
              onMouseEnter={playTabSwitch}
            >
              <Briefcase className="h-4 w-4" />
              Portfolio
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="wallet" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <ClientOnly fallback={
                <Card className="glass holo-border">
                  <CardHeader>
                    <CardTitle>Loading Wallet...</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Initializing wallet connection...</p>
                  </CardContent>
                </Card>
              }>
                <WalletConnect />
              </ClientOnly>
              <Card className="glass holo-border" onMouseEnter={playCardHover}>
                <CardHeader>
                  <CardTitle>Wallet Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-2">
                    <p>• Connect MetaMask wallet</p>
                    <p>• View account balance and details</p>
                    <p>• Send LT transactions</p>
                    <p>• Sign messages for verification</p>
                    <p>• Switch between networks</p>
                  </div>
                </CardContent>
              </Card>
              
              {/* Action Buttons */}
              <div className="mt-4 space-y-3">
                <button
                  onClick={() => window.location.href = '/wallet'}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5"
                >
                  Go to Wallet
                </button>
                <button
                  onClick={() => window.location.href = '/upload'}
                  className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/25 hover:-translate-y-0.5"
                >
                  Upload & Mint Land NFT
                </button>
                <button
                  onClick={() => window.location.href = '/marketplace'}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-green-500/25 hover:-translate-y-0.5"
                >
                  Browse Marketplace
                </button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="verification" className="mt-6">
            <ClientOnly fallback={
              <Card className="glass holo-border">
                <CardHeader>
                  <CardTitle>Loading Verification...</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Initializing land verification...</p>
                </CardContent>
              </Card>
            }>
              <LandVerification />
            </ClientOnly>
          </TabsContent>
          
          <TabsContent value="marketplace" className="mt-6">
            <ClientOnly fallback={
              <Card className="glass holo-border">
                <CardHeader>
                  <CardTitle>Loading Marketplace...</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Initializing marketplace...</p>
                </CardContent>
              </Card>
            }>
              <LandMarketplaceEnhanced />
            </ClientOnly>
          </TabsContent>
          
          <TabsContent value="map" className="mt-6">
            <MapHologramSection />
          </TabsContent>
          
          <TabsContent value="portfolio" className="mt-6">
            <PortfolioMapSection />
          </TabsContent>
        </Tabs>
      </section>

      <footer className="mx-auto max-w-6xl px-6 py-10 text-xs text-muted-foreground">
        IotAlliance.
      </footer>
    </main>
  )
}
