'use client'

import ThirdwebMarketplace from '@/components/thirdweb-marketplace'
import { WalletProvider } from '@/contexts/wallet-context'

export default function ThirdwebMarketplacePage() {
  return (
    <WalletProvider>
      <ThirdwebMarketplace />
    </WalletProvider>
  )
}
