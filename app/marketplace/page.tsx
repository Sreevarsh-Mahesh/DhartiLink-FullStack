'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import LandMarketplaceEnhanced from '@/components/land-marketplace-enhanced'
import { Badge } from '@/components/ui/badge'
import { WalletProvider } from '@/contexts/wallet-context'

export default function MarketplacePage() {
  return (
    <WalletProvider>
      <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 text-amber-50 hover:text-amber-100 transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span className="text-lg font-semibold">DhartiLink</span>
            </Link>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="border-amber-500/30 text-amber-500">
                Marketplace
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-amber-50 mb-4">
            Land NFT Marketplace
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Buy and sell land NFTs using ERupeeDummy tokens on the blockchain
          </p>
        </div>

        <LandMarketplaceEnhanced />
      </main>
      </div>
    </WalletProvider>
  )
}
