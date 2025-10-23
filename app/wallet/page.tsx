'use client'
import React, { useState, useEffect } from 'react'
import { WalletProvider, useWalletContext } from '@/contexts/wallet-context'
import { usePurchasedLands } from '@/contexts/purchased-lands-context'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Wallet, Upload, FileText, ArrowLeft, Zap, Shield, CheckCircle, Clock, TrendingUp, Copy, ExternalLink, DollarSign } from 'lucide-react'
import { useSoundManager } from '@/components/sound-manager'
import TitleTransition from '@/components/title-transition'
import { toast } from 'sonner'
import { ethers } from 'ethers'
import { ERUPEE_ABI } from '@/lib/contracts'

export default function WalletPage() {
  const router = useRouter()
  const { addPurchasedLand } = usePurchasedLands()
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [tokens, setTokens] = useState<any[]>([])
  const [connectedAccount, setConnectedAccount] = useState<string | null>(null)
  const [ethBalance, setEthBalance] = useState<string>('0')
  const [erupeeBalance, setERupeeBalance] = useState<string>('0')
  const [isLoadingBalance, setIsLoadingBalance] = useState(false)

  // Check if MetaMask is already connected on page load
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        try {
          const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' })
          if (accounts.length > 0) {
            setConnectedAccount(accounts[0])
            await fetchEthBalance(accounts[0])
            await fetchERupeeBalance(accounts[0])
          }
        } catch (err) {
          console.error('Error checking MetaMask connection:', err)
        }
      }
    }
    
    checkConnection()
  }, [])

  function arrayBufferToBase64(buffer: ArrayBuffer) {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    const chunkSize = 0x8000
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunkSize)))
    }
    return typeof window !== 'undefined' ? window.btoa(binary) : Buffer.from(binary, 'binary').toString('base64')
  }

  async function handleVerify() {
    if (!file) {
      setStatus('Please select a PDF document first.')
      return
    }
    setLoading(true)
    setStatus('Uploading and scanning...')
    try {
      const arrayBuffer = await file.arrayBuffer()
      const b64 = arrayBufferToBase64(arrayBuffer)
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, content: b64 }),
      })
      
      // Check if response is JSON
      const contentType = res.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text()
        console.error('Non-JSON response:', text)
        setStatus('Server returned invalid response format')
        return
      }
      
      const data = await res.json()
      console.log('verify response', data)
      if (res.ok && data.ok) {
        setStatus(data.message || 'Verified successfully')
        if (data.nft) {
          setTokens((t) => [data.nft, ...t])
        } else if (data.token) {
          setTokens((t) => [{ id: data.token, coordinates: data.coordinates ?? null, sourceFile: file.name }, ...t])
        }
      } else {
        setStatus(data?.message || 'Verification failed')
      }
    } catch (err) {
      console.error(err)
      setStatus('Network or server error')
    } finally {
      setLoading(false)
    }
  }

  async function fetchEthBalance(account: string) {
    try {
      setIsLoadingBalance(true)
      const balance = await (window as any).ethereum.request({
        method: 'eth_getBalance',
        params: [account, 'latest']
      })
      // Convert from wei to ETH (1 ETH = 10^18 wei)
      const balanceInEth = (parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4)
      setEthBalance(balanceInEth)
    } catch (err) {
      console.error('Error fetching balance:', err)
      setEthBalance('0')
    } finally {
      setIsLoadingBalance(false)
    }
  }

  async function fetchERupeeBalance(account: string) {
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum)
      const erupeeContractAddress = process.env.NEXT_PUBLIC_ERUPEE_DUMMY_CONTRACT_ADDRESS || '0x08001a1B010FFA09d6c2Bd331C0a3f04d175B8BE'
      const contract = new ethers.Contract(erupeeContractAddress, ERUPEE_ABI, provider)
      const balance = await contract.balanceOf(account)
      const balanceInERupee = ethers.formatEther(balance)
      setERupeeBalance(balanceInERupee)
    } catch (err) {
      console.error('Error fetching ERupee balance:', err)
      setERupeeBalance('0')
    }
  }

  async function connectMetaMask() {
    try {
      if (typeof window === 'undefined' || !(window as any).ethereum) {
        setStatus('MetaMask not detected in this browser.')
        return
      }
      const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' })
      if (Array.isArray(accounts) && accounts[0]) {
        setConnectedAccount(accounts[0])
        setStatus(`Connected: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`)
        // Fetch the balance for the connected account
        await fetchEthBalance(accounts[0])
        await fetchERupeeBalance(accounts[0])
      } else {
        setStatus('No account returned from MetaMask.')
      }
    } catch (err) {
      console.error('MetaMask connect error', err)
      setStatus('MetaMask connection failed.')
    }
  }

  function pushToPortfolio(tokenObj: any) {
    try {
      const tokenId = tokenObj.id ?? tokenObj.token
      
      // Create a land property from the token data
      const landProperty = {
        id: tokenId,
        title: `Land ${tokenId.slice(-4)}`, // Use last 4 characters for display
        description: `Verified land document with coordinates: ${Array.isArray(tokenObj.coordinates) ? tokenObj.coordinates.map((c: any) => `${c.lat}, ${c.lon}`).join(' · ') : 'N/A'}`,
        price: '0', // Free acquisition through verification
        area: '1.0 acres', // Default area
        location: 'Verified Location',
        seller: 'System',
        sellerName: 'DhartiLink Verification',
        purchaseDate: new Date().toISOString().split('T')[0],
        sourceFile: tokenObj.sourceFile,
        coordinates: tokenObj.coordinates
      }
      
      // Add to purchased lands
      addPurchasedLand(landProperty)
      
      // Show success message
      setStatus(`Token ${tokenId} added to portfolio successfully!`)
      
      // Navigate to portfolio section on main page
      router.push('/#portfolio')
      
    } catch (e) {
      console.error('Error adding to portfolio:', e)
      setStatus('Error adding token to portfolio')
    }
  }

  const { playButtonClick, playCardHover } = useSoundManager()

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
    playButtonClick()
  }

  return (
    <WalletProvider>
      <main className="min-h-screen bg-black relative overflow-hidden">
        {/* Holographic Background */}
        <div className="holo-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
        
        {/* Back Button */}
        <div className="absolute top-6 left-6 z-50">
          <Button
            onClick={() => {
              playButtonClick()
              router.push('/#wallet')
            }}
            variant="outline"
            className="glass holo-border flex items-center gap-2 hover:scale-105 transition-transform"
            onMouseEnter={playCardHover}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Main
          </Button>
        </div>

        {/* Main Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
          {/* Header Section */}
          <div className="mb-12 text-center">
            <div className="inline-block scale-90">
              <TitleTransition />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Balance Card */}
            <Card className="glass holo-border group hover:scale-105 transition-all duration-300" onMouseEnter={playCardHover}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-50">
                  <Wallet className="h-5 w-5 text-blue-400" />
                  Wallet Balance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {connectedAccount ? (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Status</span>
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Connected
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg border border-gray-700">
                        <span className="text-xs text-gray-400 font-mono">
                          {connectedAccount.slice(0, 10)}...{connectedAccount.slice(-8)}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => copyToClipboard(connectedAccount)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">ERupee Balance</span>
                        <DollarSign className="h-4 w-4 text-amber-400" />
                      </div>
                      <div className="text-3xl font-bold text-amber-400">
                        {isLoadingBalance ? (
                          <span className="text-lg">Loading...</span>
                        ) : (
                          `₹${parseFloat(erupeeBalance).toFixed(2)}`
                        )}
                      </div>
                      <div className="text-sm text-gray-500">ERupeeDummy Tokens</div>
                    </div>
                    
                    <div className="space-y-2 pt-2 border-t border-gray-700">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">ETH Balance</span>
                        <Zap className="h-4 w-4 text-yellow-400" />
                      </div>
                      <div className="text-lg font-semibold text-blue-50">
                        {isLoadingBalance ? (
                          <span className="text-sm">Loading...</span>
                        ) : (
                          `${ethBalance} ETH`
                        )}
                      </div>
                      <div className="text-xs text-gray-500">For gas fees</div>
                    </div>

                    <Button 
                      onClick={async () => {
                        await fetchEthBalance(connectedAccount)
                        await fetchERupeeBalance(connectedAccount)
                      }} 
                      disabled={isLoadingBalance}
                      className="w-full bg-amber-600 hover:bg-amber-700"
                      onMouseEnter={playCardHover}
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Refresh Balances
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Status</span>
                        <Badge variant="secondary" className="bg-gray-700/30">
                          Not Connected
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-3xl font-bold text-gray-500">₹0.00</div>
                      <div className="text-sm text-gray-600">Connect to view ERupee balance</div>
                    </div>

                    <Button 
                      onClick={connectMetaMask}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                      onMouseEnter={playCardHover}
                    >
                      <Wallet className="h-4 w-4 mr-2" />
                      Connect MetaMask
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="glass holo-border group hover:scale-105 transition-all duration-300" onMouseEnter={playCardHover}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-50">
                  <Shield className="h-5 w-5 text-green-400" />
                  Verification Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg border border-gray-700">
                    <span className="text-sm text-gray-400">Total Verified</span>
                    <span className="text-xl font-bold text-blue-50">{tokens.length}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg border border-gray-700">
                    <span className="text-sm text-gray-400">NFTs Created</span>
                    <span className="text-xl font-bold text-green-400">{tokens.length}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg border border-gray-700">
                    <span className="text-sm text-gray-400">Success Rate</span>
                    <span className="text-xl font-bold text-blue-400">100%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="glass holo-border group hover:scale-105 transition-all duration-300" onMouseEnter={playCardHover}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-50">
                  <Clock className="h-5 w-5 text-purple-400" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tokens.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No activity yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {tokens.slice(0, 3).map((t, idx) => (
                      <div key={t.id || t.token} className="p-3 bg-gray-900/30 rounded-lg border border-gray-700">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-400">Document Verified</span>
                          <CheckCircle className="h-3 w-3 text-green-400" />
                        </div>
                        <div className="text-sm font-mono text-blue-50 truncate">
                          {(t.id ?? t.token).slice(0, 20)}...
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Action Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Land Verification Section */}
            <div className="lg:col-span-2">
              <Card className="glass holo-border" onMouseEnter={playCardHover}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-50 text-2xl">
                    <Upload className="h-6 w-6 text-blue-400" />
                    Verify Land Document
                  </CardTitle>
                  <p className="text-gray-400 mt-2">
                    Upload a land document (PDF). Our AI will extract coordinates and convert to an NFT on success.
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* File Upload Area */}
                  <div className="relative">
                    <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-blue-500/50 transition-colors">
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => {
                          setFile(e.target.files?.[0] ?? null)
                          playButtonClick()
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-500" />
                      {file ? (
                        <div className="space-y-2">
                          <p className="text-blue-400 font-semibold">{file.name}</p>
                          <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                        </div>
                      ) : (
                        <>
                          <p className="text-gray-400 mb-2">Drop your PDF here or click to browse</p>
                          <p className="text-sm text-gray-600">Supported: PDF documents only</p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <Button
                      onClick={() => {
                        handleVerify()
                        playButtonClick()
                      }}
                      disabled={loading || !file}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-lg py-6"
                      onMouseEnter={playCardHover}
                    >
                      {loading ? (
                        <>
                          <Clock className="h-5 w-5 mr-2 animate-spin" />
                          Scanning Document...
                        </>
                      ) : (
                        <>
                          <Shield className="h-5 w-5 mr-2" />
                          Verify Land Document
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => {
                        setFile(null)
                        setStatus(null)
                        playButtonClick()
                      }}
                      variant="outline"
                      className="glass holo-border px-6"
                      onMouseEnter={playCardHover}
                    >
                      Reset
                    </Button>
                  </div>

                  {/* Status Display */}
                  {status && (
                    <div className={`p-4 rounded-lg border ${
                      status.toLowerCase().includes('success') 
                        ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                        : 'bg-red-500/10 border-red-500/30 text-red-400'
                    }`}>
                      <div className="flex items-start gap-3">
                        {status.toLowerCase().includes('success') ? (
                          <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        ) : (
                          <Shield className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold mb-1">
                            {status.toLowerCase().includes('success') ? 'Verification Successful' : 'Verification Status'}
                          </p>
                          <p className="text-sm opacity-90">{status}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Verified Tokens List */}
            <div>
              <Card className="glass holo-border" onMouseEnter={playCardHover}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-50">
                    <Zap className="h-5 w-5 text-yellow-400" />
                    Verified Tokens
                  </CardTitle>
                  <p className="text-sm text-gray-400 mt-2">
                    Your land NFTs from verified documents
                  </p>
                </CardHeader>
                <CardContent>
                  {tokens.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-16 w-16 mx-auto mb-3 text-gray-700" />
                      <p className="text-gray-500 mb-1">No tokens yet</p>
                      <p className="text-sm text-gray-600">Verify documents to create NFTs</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                      {tokens.map((t) => (
                        <div 
                          key={t.id || t.token} 
                          className="p-4 bg-gray-900/30 rounded-lg border border-gray-700 hover:border-blue-500/50 transition-colors group"
                          onMouseEnter={playCardHover}
                        >
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                                    Verified
                                  </Badge>
                                </div>
                                <div className="font-mono text-sm text-blue-50 break-all mb-2">
                                  {t.id ?? t.token}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => copyToClipboard(t.id ?? t.token)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                            
                            <div className="space-y-1 text-xs text-gray-400">
                              <div className="flex items-center gap-2">
                                <FileText className="h-3 w-3" />
                                <span className="truncate">{t.sourceFile ?? 'Unknown'}</span>
                              </div>
                              {Array.isArray(t.coordinates) && t.coordinates.length > 0 && (
                                <div className="flex items-start gap-2">
                                  <ExternalLink className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                  <span className="break-all">
                                    {t.coordinates.map((c: any) => `${c.lat}, ${c.lon}`).join(' · ')}
                                  </span>
                                </div>
                              )}
                            </div>

                            <Button
                              onClick={() => {
                                pushToPortfolio(t)
                                playButtonClick()
                              }}
                              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-sm"
                              onMouseEnter={playCardHover}
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              Send to Portfolio
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </WalletProvider>
  )
}