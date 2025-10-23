'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, MapPin, DollarSign, Calendar, Eye, Navigation, Receipt, ExternalLink, Loader2, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useSoundManager } from '@/components/sound-manager'
import { useWalletContext, WalletProvider } from '@/contexts/wallet-context'
import dynamic from 'next/dynamic'

// Dynamically import the map component
const MapHologramSection = dynamic(() => import('@/components/map-hologram-section'), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gray-900/50 rounded-lg flex items-center justify-center">
      <div className="text-gray-400">Loading interactive map...</div>
    </div>
  )
})

interface LandNFT {
  tokenId: string
  owner: string
  metadata: {
    name: string
    description: string
    image: string
    attributes: Array<{
      trait_type: string
      value: string
    }>
    coordinates: {
      latitude: number
      longitude: number
    }
  }
  price?: string
  isListed: boolean
  coordinates?: string
  documentURI?: string
}

interface Transaction {
  hash: string
  type: 'mint' | 'buy' | 'sell' | 'list'
  tokenId?: string
  amount?: string
  timestamp: string
  status: 'success' | 'pending' | 'failed'
  blockNumber?: string
}

function PortfolioPageContent() {
  const { account, isConnected } = useWalletContext()
  const [selectedProperty, setSelectedProperty] = useState<any>(null)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [activeTab, setActiveTab] = useState('nfts')
  const { playButtonClick, playCardHover, playMapZoom } = useSoundManager()

  // Real data states
  const [userNFTs, setUserNFTs] = useState<LandNFT[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Load user's NFTs and transactions
  useEffect(() => {
    if (account && isConnected) {
      loadPortfolioData()
    }
  }, [account, isConnected])

  const loadPortfolioData = async () => {
    setLoading(true)
    try {
      // Load user's NFTs
      const nftsResponse = await fetch(`/api/marketplace?action=user-nfts&address=${account}`)
      const nftsData = await nftsResponse.json()
      
      if (nftsData.success) {
        setUserNFTs(nftsData.data.nfts)
      }

      // Load transaction history (try enhanced first, fallback to basic)
      try {
        const txResponse = await fetch(`/api/transactions/enhanced?address=${account}`)
        const txData = await txResponse.json()
        
        if (txData.success) {
          setTransactions(txData.data.transactions)
        }
      } catch (error) {
        console.error('Error loading enhanced transactions, falling back to basic:', error)
        // Fallback to basic transactions
        const txResponse = await fetch(`/api/transactions?address=${account}`)
        const txData = await txResponse.json()
        
        if (txData.success) {
          setTransactions(txData.data.transactions)
        }
      }
    } catch (error) {
      console.error('Error loading portfolio data:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await loadPortfolioData()
    setRefreshing(false)
  }

  const handlePropertySelect = (property: any) => {
    setSelectedProperty(property)
    setViewMode('map')
    playMapZoom()
  }

  const getCoordinates = (nft: LandNFT) => {
    const lat = nft.metadata.attributes.find(attr => attr.trait_type === 'Latitude')?.value
    const lon = nft.metadata.attributes.find(attr => attr.trait_type === 'Longitude')?.value
    return lat && lon ? `${lat}, ${lon}` : 'Unknown'
  }

  const getEtherscanUrl = (hash: string) => {
    return `https://sepolia.etherscan.io/tx/${hash}`
  }

  const totalValue = userNFTs.length * 100000 // Mock calculation
  const totalInvestment = userNFTs.length * 100000 // Mock calculation
  const profit = 0 // Mock calculation

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="glass holo-border max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-amber-50 mb-4">Wallet Not Connected</CardTitle>
            <CardDescription className="text-gray-400 mb-6">
              Please connect your wallet to view your portfolio and transaction history.
            </CardDescription>
            <Link href="/">
              <Button className="w-full bg-amber-600 hover:bg-amber-700">
                Go to Home
              </Button>
            </Link>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
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
              <Button
                onClick={refreshData}
                disabled={refreshing}
                variant="outline"
                className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
              >
                {refreshing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh
              </Button>
              <Badge variant="outline" className="border-amber-500/30 text-amber-500">
                Portfolio
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-amber-50 mb-4">
            My Portfolio
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Manage your land investments and track property performance
          </p>
        </div>

        {/* Portfolio Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glass holo-border">
            <CardHeader>
              <CardTitle className="text-amber-50 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Total Properties
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-50">
                {userNFTs.length}
              </div>
              <p className="text-sm text-gray-400">Land parcels owned</p>
            </CardContent>
          </Card>

          <Card className="glass holo-border">
            <CardHeader>
              <CardTitle className="text-amber-50 flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Total Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-50">
                ₹{totalValue.toLocaleString()}
              </div>
              <p className="text-sm text-gray-400">Current market value</p>
            </CardContent>
          </Card>

          <Card className="glass holo-border">
            <CardHeader>
              <CardTitle className="text-amber-50 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Total Investment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-50">
                ₹{totalInvestment.toLocaleString()}
              </div>
              <p className="text-sm text-gray-400">Initial investment</p>
            </CardContent>
          </Card>

          <Card className="glass holo-border">
            <CardHeader>
              <CardTitle className="text-amber-50 flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                Profit/Loss
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {profit >= 0 ? '+' : ''}₹{profit.toLocaleString()}
              </div>
              <p className="text-sm text-gray-400">
                {profit >= 0 ? 'Gain' : 'Loss'} ({totalInvestment > 0 ? ((profit / totalInvestment) * 100).toFixed(2) : 0}%)
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for NFTs and Transactions */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="nfts" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              My Land NFTs ({userNFTs.length})
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Transaction History ({transactions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="nfts" className="space-y-6">
            {/* View Toggle */}
            <div className="flex justify-center mb-8">
              <div className="flex bg-gray-900/50 rounded-lg p-1">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  onClick={() => {
                    setViewMode('list')
                    playButtonClick()
                  }}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  List View
                </Button>
                <Button
                  variant={viewMode === 'map' ? 'default' : 'ghost'}
                  onClick={() => {
                    setViewMode('map')
                    playButtonClick()
                  }}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  Map View
                </Button>
              </div>
            </div>

            {/* Content based on view mode */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
              </div>
            ) : viewMode === 'list' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userNFTs.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <MapPin className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-400 mb-2">No Land NFTs Found</h3>
                    <p className="text-gray-500">You don't own any land NFTs yet. Start by minting your first land!</p>
                    <Link href="/upload" className="mt-4 inline-block">
                      <Button className="bg-amber-600 hover:bg-amber-700">
                        Mint Land NFT
                      </Button>
                    </Link>
                  </div>
                ) : (
                  userNFTs.map((nft) => (
                    <Card 
                      key={nft.tokenId} 
                      className="glass holo-border hover:scale-105 transition-all duration-300 cursor-pointer"
                      onMouseEnter={playCardHover}
                      onClick={() => handlePropertySelect(nft)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <Badge className={nft.isListed ? "bg-green-600 text-white" : "bg-gray-600 text-white"}>
                            {nft.isListed ? 'Listed' : 'Owned'}
                          </Badge>
                          <Badge variant="outline" className="border-amber-500/30 text-amber-500">
                            Token #{nft.tokenId}
                          </Badge>
                        </div>
                        <CardTitle className="text-amber-50">{nft.metadata.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1 text-gray-400">
                          <MapPin className="h-4 w-4" />
                          {getCoordinates(nft)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <p className="text-sm text-gray-400">{nft.metadata.description}</p>
                          {nft.isListed && nft.price && (
                            <div className="flex justify-between">
                              <span className="text-gray-400">Listed Price:</span>
                              <span className="text-amber-50 font-bold">{nft.price} ERupee</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-gray-400">Owner:</span>
                            <span className="text-sm font-mono text-gray-300">{nft.owner.slice(0, 6)}...{nft.owner.slice(-4)}</span>
                          </div>
                        </div>

                        <Button 
                          className="w-full bg-amber-600 hover:bg-amber-700 flex items-center gap-2"
                          onClick={playButtonClick}
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            ) : (
              <Card className="glass holo-border">
                <CardHeader>
                  <CardTitle className="text-amber-50 flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Interactive Map
                    {selectedProperty && (
                      <Badge variant="outline" className="border-amber-500/30 text-amber-500 ml-auto">
                        {selectedProperty.metadata?.name || selectedProperty.title}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[600px] relative">
                    <MapHologramSection />
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-400 mb-2">No Transactions Found</h3>
                <p className="text-gray-500">Your transaction history will appear here once you start minting or trading land NFTs.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((tx, index) => (
                  <Card key={index} className="glass holo-border">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-full ${
                            tx.type === 'mint' ? 'bg-green-500/20' :
                            tx.type === 'buy' ? 'bg-blue-500/20' :
                            tx.type === 'sell' ? 'bg-purple-500/20' :
                            'bg-amber-500/20'
                          }`}>
                            {tx.type === 'mint' ? <MapPin className="h-5 w-5 text-green-500" /> :
                             tx.type === 'buy' ? <DollarSign className="h-5 w-5 text-blue-500" /> :
                             tx.type === 'sell' ? <Navigation className="h-5 w-5 text-purple-500" /> :
                             <Receipt className="h-5 w-5 text-amber-500" />}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-amber-50 capitalize">
                              {tx.type} {tx.tokenId && `Token #${tx.tokenId}`}
                            </h3>
                            <p className="text-sm text-gray-400">
                              {new Date(tx.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge className={
                            tx.status === 'success' ? 'bg-green-600' :
                            tx.status === 'pending' ? 'bg-yellow-600' :
                            'bg-red-600'
                          }>
                            {tx.status}
                          </Badge>
                          {tx.blockNumber && (
                            <Badge variant="outline" className="border-blue-500/30 text-blue-500">
                              Block #{tx.blockNumber}
                            </Badge>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(getEtherscanUrl(tx.hash), '_blank')}
                            className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Verify on Etherscan
                          </Button>
                        </div>
                      </div>
                      <div className="mt-4 p-3 bg-gray-900/50 rounded-lg">
                        <p className="text-sm font-mono text-gray-300 break-all">
                          {tx.hash}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Portfolio Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass holo-border text-center">
            <CardHeader>
              <DollarSign className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <CardTitle className="text-amber-50">Value Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">
                Real-time property value updates based on market conditions
              </p>
            </CardContent>
          </Card>

          <Card className="glass holo-border text-center">
            <CardHeader>
              <MapPin className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <CardTitle className="text-amber-50">Interactive Maps</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">
                Visualize your properties with 3D mapping and satellite imagery
              </p>
            </CardContent>
          </Card>

          <Card className="glass holo-border text-center">
            <CardHeader>
              <Calendar className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <CardTitle className="text-amber-50">Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">
                Track investment performance and ROI over time
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default function PortfolioPage() {
  return (
    <WalletProvider>
      <PortfolioPageContent />
    </WalletProvider>
  )
}
