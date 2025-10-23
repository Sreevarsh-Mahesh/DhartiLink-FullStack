'use client'

import React from 'react'

// Simple wrapper without Thirdweb to avoid ethers conflicts
export function ThirdwebProviderWrapper({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
