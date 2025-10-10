'use client'

import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react'
import { useWallet, WalletState, WalletActions } from '@/hooks/use-wallet'

interface WalletContextType extends WalletState, WalletActions {}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState(false)
  const wallet = useWallet()
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  // Return a default state during SSR
  if (!isClient) {
    const defaultWallet: WalletContextType = {
      isConnected: false,
      account: null,
      balance: null,
      chainId: null,
      provider: null,
      signer: null,
      error: null,
      connect: async () => {},
      disconnect: () => {},
      switchNetwork: async () => {},
      sendTransaction: async () => null,
      signMessage: async () => null,
    }
    
    return (
      <WalletContext.Provider value={defaultWallet}>
        {children}
      </WalletContext.Provider>
    )
  }
  
  return (
    <WalletContext.Provider value={wallet}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWalletContext() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWalletContext must be used within a WalletProvider')
  }
  return context
}
