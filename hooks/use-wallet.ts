'use client'

import { useState, useEffect, useCallback } from 'react'
import detectEthereumProvider from '@metamask/detect-provider'
import { ethers } from 'ethers'
import { ERUPEE_ABI } from '@/lib/contracts'

export interface WalletState {
  isConnected: boolean
  account: string | null
  balance: string | null
  erupeeBalance: string | null
  chainId: string | null
  provider: ethers.BrowserProvider | null
  signer: ethers.JsonRpcSigner | null
  error: string | null
}

export interface WalletActions {
  connect: () => Promise<void>
  disconnect: () => void
  switchNetwork: (chainId: string) => Promise<void>
  sendTransaction: (to: string, amount: string) => Promise<string | null>
  signMessage: (message: string) => Promise<string | null>
}

export function useWallet(): WalletState & WalletActions {
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    account: null,
    balance: null,
    erupeeBalance: null,
    chainId: null,
    provider: null,
    signer: null,
    error: null,
  })

  // Function to fetch ERupeeDummy balance
  const fetchERupeeBalance = useCallback(async (provider: ethers.BrowserProvider, account: string): Promise<string> => {
    try {
      const erupeeContractAddress = process.env.NEXT_PUBLIC_ERUPEE_DUMMY_CONTRACT_ADDRESS || '0x08001a1B010FFA09d6c2Bd331C0a3f04d175B8BE'
      const contract = new ethers.Contract(erupeeContractAddress, ERUPEE_ABI, provider)
      const balance = await contract.balanceOf(account)
      return ethers.formatEther(balance)
    } catch (error) {
      console.error('Error fetching ERupee balance:', error)
      return '0'
    }
  }, [])

  const connect = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null }))
      
      const provider = await detectEthereumProvider()
      if (!provider) {
        throw new Error('MetaMask not detected. Please install MetaMask.')
      }

      const ethereum = provider as any
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
      
      if (accounts.length === 0) {
        throw new Error('No accounts found')
      }

      const ethersProvider = new ethers.BrowserProvider(ethereum)
      const signer = await ethersProvider.getSigner()
      const account = accounts[0]
      const balance = await ethersProvider.getBalance(account)
      const erupeeBalance = await fetchERupeeBalance(ethersProvider, account)
      const network = await ethersProvider.getNetwork()

      setState({
        isConnected: true,
        account,
        balance: ethers.formatEther(balance),
        erupeeBalance,
        chainId: network.chainId.toString(),
        provider: ethersProvider,
        signer,
        error: null,
      })
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to connect wallet',
      }))
    }
  }, [])

  const disconnect = useCallback(() => {
    setState({
      isConnected: false,
      account: null,
      balance: null,
      erupeeBalance: null,
      chainId: null,
      provider: null,
      signer: null,
      error: null,
    })
  }, [])

  const switchNetwork = useCallback(async (chainId: string) => {
    if (!state.provider) return

    try {
      const ethereum = (state.provider as any).provider
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${parseInt(chainId).toString(16)}` }],
      })
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to switch network',
      }))
    }
  }, [state.provider])

  const sendTransaction = useCallback(async (to: string, amount: string): Promise<string | null> => {
    if (!state.signer) {
      setState(prev => ({ ...prev, error: 'Wallet not connected' }))
      return null
    }

    try {
      // For 0-value transactions, just simulate success
      if (amount === '0' || amount === '0.0') {
        // Generate a fake transaction hash for demo purposes
        const fakeHash = '0x' + Math.random().toString(16).substr(2, 64)
        return fakeHash
      }

      const tx = await state.signer.sendTransaction({
        to,
        value: ethers.parseEther(amount),
      })
      
      await tx.wait()
      return tx.hash
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Transaction failed',
      }))
      return null
    }
  }, [state.signer])

  const signMessage = useCallback(async (message: string): Promise<string | null> => {
    if (!state.signer) {
      setState(prev => ({ ...prev, error: 'Wallet not connected' }))
      return null
    }

    try {
      const signature = await state.signer.signMessage(message)
      return signature
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to sign message',
      }))
      return null
    }
  }, [state.signer])

  // Check if already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const provider = await detectEthereumProvider()
        if (provider) {
          const ethereum = provider as any
          const accounts = await ethereum.request({ method: 'eth_accounts' })
          if (accounts.length > 0) {
            connect()
          }
        }
      } catch (error) {
        // Silently handle errors during SSR
        console.debug('Wallet connection check failed:', error)
      }
    }
    
    // Only run on client side
    if (typeof window !== 'undefined') {
      checkConnection()
    }
  }, [connect])

  // Listen for account changes
  useEffect(() => {
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect()
      } else {
        connect()
      }
    }

    const handleChainChanged = () => {
      connect()
    }

    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const ethereum = (window as any).ethereum
      ethereum.on('accountsChanged', handleAccountsChanged)
      ethereum.on('chainChanged', handleChainChanged)

      return () => {
        ethereum.removeListener('accountsChanged', handleAccountsChanged)
        ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [connect, disconnect])

  return {
    ...state,
    connect,
    disconnect,
    switchNetwork,
    sendTransaction,
    signMessage,
  }
}
