'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useWalletContext } from '@/contexts/wallet-context'
import { Wallet, Copy, ExternalLink, LogOut, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useSoundManager } from '@/components/sound-manager'

export function WalletConnect() {
  const {
    isConnected,
    account,
    balance,
    ltTokenBalance,
    chainId,
    error,
    connect,
    disconnect,
  } = useWalletContext()

  const [isConnecting, setIsConnecting] = useState(false)
  const { 
    playButtonClick, 
    playWalletConnect, 
    playWalletDisconnect,
    playHover,
    playCardHover,
    playSuccess,
    playError,
  } = useSoundManager()

  const createConnectSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(1000, audioContext.currentTime + 0.3)
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.05)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    } catch (error) {
      console.warn('Audio context not available:', error)
    }
  }

  const handleConnect = async () => {
    setIsConnecting(true)
    playButtonClick()
    try {
      await connect()
      playWalletConnect()
      toast.success('Wallet connected successfully!')
    } catch (err) {
      toast.error('Failed to connect wallet')
    } finally {
      setIsConnecting(false)
    }
  }

  const createDisconnectSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.2)
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.08, audioContext.currentTime + 0.05)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.2)
    } catch (error) {
      console.warn('Audio context not available:', error)
    }
  }

  const handleDisconnect = async () => {
    createDisconnectSound()
    disconnect()
    toast.success('Wallet disconnected')
    try {
      const eth = (window as any)?.ethereum
      // Open MetaMask permissions panel; user can revoke/re-approve accounts
      if (eth?.request) {
        try {
          await eth.request({ method: 'wallet_requestPermissions', params: [{ eth_accounts: {} }] })
        } catch {}
      }
      // Then explicitly request accounts to trigger connect prompt if needed
      await connect()
      toast.success('Approve in MetaMask to sign in again')
    } catch {
      // If user closes MetaMask, they can click Connect manually
    }
  }

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account)
      toast.success('Address copied to clipboard')
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatBalance = (balance: string) => {
    return parseFloat(balance).toFixed(4)
  }

  if (!isConnected) {
    return (
      <Card className="glass holo-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Connect Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Connect your MetaMask wallet to access DhartiLink features
          </p>
        <Button
          onClick={handleConnect}
          disabled={isConnecting}
          className="w-full"
          onMouseEnter={playHover}
        >
            {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
          </Button>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass holo-border">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Connected
          </div>
          <Badge variant="secondary" className="bg-green-500/20 text-green-400">
            Connected
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Address:</span>
            <div className="flex items-center gap-2">
              <code className="text-xs font-mono">{formatAddress(account!)}</code>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyAddress}
                className="h-6 w-6 p-0"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">ETH Balance:</span>
            <span className="text-sm font-mono">
              {formatBalance(balance!)} ETH
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">LT Balance:</span>
            <span className="text-sm font-mono font-semibold text-blue-400">
              {ltTokenBalance ? formatBalance(ltTokenBalance) : '0.0000'} LT
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Network:</span>
            <Badge variant="outline">
              Chain ID: {chainId}
            </Badge>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`https://etherscan.io/address/${account}`, '_blank')}
            className="flex-1"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            View on Etherscan
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDisconnect}
            className="flex-1"
            onMouseEnter={playHover}
          >
            <LogOut className="h-3 w-3 mr-1" />
            Disconnect
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
