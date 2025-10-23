'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ShoppingCart, 
  MapPin, 
  DollarSign, 
  Clock, 
  User, 
  Eye, 
  Loader2,
  AlertCircle,
  CheckCircle,
  TrendingUp
} from 'lucide-react'
import { useWalletContext } from '@/contexts/wallet-context'
import { useSoundManager } from '@/components/sound-manager'

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
}

interface MarketplaceStats {
  totalListings: number
  totalVolume: string
  averagePrice: string
  activeTraders: number
}

export default function LandMarketplaceEnhanced() {
  const { account, isConnected } = useWalletContext()
  const { playButtonClick, playCardHover } = useSoundManager()
  
  const [nfts, setNfts] = useState<LandNFT[]>([])
  const [stats, setStats] = useState<MarketplaceStats>({
    totalListings: 0,
    totalVolume: '0',
    averagePrice: '0',
    activeTraders: 0
  })
  const [loading, setLoading] = useState(true)
  const [erupeeBalance, setERupeeBalance] = useState('0')
  const [selectedTab, setSelectedTab] = useState('browse')
  const [listingPrice, setListingPrice] = useState('')
  const [selectedNFT, setSelectedNFT] = useState<LandNFT | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Mock data for demonstration
  const mockNFTs: LandNFT[] = [
    {
      tokenId: '1',
      owner: '0x1234...5678',
      metadata: {
        name: 'Chennai Tech Park',
        description: 'Prime commercial land in Chennai',
        image: 'https://gateway.pinata.cloud/ipfs/QmPlaceholder1',
        attributes: [
          { trait_type: 'Latitude', value: '13.0827' },
          { trait_type: 'Longitude', value: '80.2707' },
          { trait_type: 'Type', value: 'Commercial' }
        ],
        coordinates: { latitude: 13.0827, longitude: 80.2707 }
      },
      price: '1000',
      isListed: true
    },
    {
      tokenId: '2',
      owner: '0x9876...5432',
      metadata: {
        name: 'Bangalore IT Hub',
        description: 'Residential plot in Bangalore',
        image: 'https://gateway.pinata.cloud/ipfs/QmPlaceholder2',
        attributes: [
          { trait_type: 'Latitude', value: '12.9716' },
          { trait_type: 'Longitude', value: '77.5946' },
          { trait_type: 'Type', value: 'Residential' }
        ],
        coordinates: { latitude: 12.9716, longitude: 77.5946 }
      },
      price: '750',
      isListed: true
    },
    {
      tokenId: '3',
      owner: account || '0x1111...2222',
      metadata: {
        name: 'Mumbai Financial District',
        description: 'Premium commercial space in Mumbai',
        image: 'https://gateway.pinata.cloud/ipfs/QmPlaceholder3',
        attributes: [
          { trait_type: 'Latitude', value: '19.0760' },
          { trait_type: 'Longitude', value: '72.8777' },
          { trait_type: 'Type', value: 'Commercial' }
        ],
        coordinates: { latitude: 19.0760, longitude: 72.8777 }
      },
      isListed: false
    }
  ]

  useEffect(() => {
    loadMarketplaceData()
  }, [account])

  const loadMarketplaceData = async () => {
    setLoading(true)
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setNfts(mockNFTs)
      setStats({
        totalListings: mockNFTs.filter(nft => nft.isListed).length,
        totalVolume: '1750',
        averagePrice: '875',
        activeTraders: 15
      })

      if (account) {
        const balance = await fetchERupeeBalance(account)
        setERupeeBalance(balance)
      }
    } catch (error) {
      console.error('Error loading marketplace data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchERupeeBalance = async (address: string): Promise<string> => {
    try {
      const response = await fetch(`/api/marketplace?action=balance&address=${address}`)
      const result = await response.json()
      return result.data?.balance || '0'
    } catch (error) {
      console.error('Error fetching ERupee balance:', error)
      return '0'
    }
  }

  const handleListNFT = async (tokenId: string, price: string) => {
    if (!account) return

    setActionLoading(tokenId)
    try {
      const response = await fetch('/api/marketplace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'list',
          tokenId,
          price,
          sellerAddress: account
        })
      })

      const result = await response.json()
      
      if (result.success) {
        // Update local state
        setNfts(prev => prev.map(nft => 
          nft.tokenId === tokenId 
            ? { ...nft, price, isListed: true }
            : nft
        ))
        setListingPrice('')
        setSelectedNFT(null)
      }
    } catch (error) {
      console.error('Error listing NFT:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleBuyNFT = async (tokenId: string, price: string) => {
    if (!account) return

    setActionLoading(tokenId)
    try {
      const response = await fetch('/api/marketplace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'buy',
          tokenId,
          price,
          buyerAddress: account
        })
      })

      const result = await response.json()
      
      if (result.success) {
        // Update local state
        setNfts(prev => prev.map(nft => 
          nft.tokenId === tokenId 
            ? { ...nft, owner: account, isListed: false, price: undefined }
            : nft
        ))
        
        // Refresh balance
        const newBalance = await fetchERupeeBalance(account)
        setERupeeBalance(newBalance)
      }
    } catch (error) {
      console.error('Error buying NFT:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancelListing = async (tokenId: string) => {
    setActionLoading(tokenId)
    try {
      // Update local state
      setNfts(prev => prev.map(nft => 
        nft.tokenId === tokenId 
          ? { ...nft, isListed: false, price: undefined }
          : nft
      ))
    } catch (error) {
      console.error('Error canceling listing:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const getCoordinates = (nft: LandNFT) => {
    const lat = nft.metadata.attributes.find(attr => attr.trait_type === 'Latitude')?.value
    const lon = nft.metadata.attributes.find(attr => attr.trait_type === 'Longitude')?.value
    return lat && lon ? `${lat}, ${lon}` : 'Unknown'
  }

  const isOwner = (nft: LandNFT) => nft.owner === account

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Marketplace Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass holo-border" onMouseEnter={playCardHover}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-2xl font-bold text-amber-50">{stats.totalListings}</p>
                <p className="text-sm text-gray-400">Active Listings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass holo-border" onMouseEnter={playCardHover}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-amber-50">{stats.totalVolume}</p>
                <p className="text-sm text-gray-400">Total Volume (ERupee)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass holo-border" onMouseEnter={playCardHover}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-amber-50">{stats.averagePrice}</p>
                <p className="text-sm text-gray-400">Avg Price (ERupee)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass holo-border" onMouseEnter={playCardHover}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold text-amber-50">{stats.activeTraders}</p>
                <p className="text-sm text-gray-400">Active Traders</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wallet Balance */}
      {isConnected && (
        <Card className="glass holo-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-amber-500" />
                <span className="text-amber-50">Your ERupee Balance:</span>
              </div>
              <Badge className="bg-amber-600 text-white">
                {erupeeBalance} ERupee
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="browse" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Browse Listings
          </TabsTrigger>
          <TabsTrigger value="my-nfts" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            My NFTs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nfts.filter(nft => nft.isListed).map((nft) => (
              <Card key={nft.tokenId} className="glass holo-border hover:scale-105 transition-all duration-300" onMouseEnter={playCardHover}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <Badge className="bg-green-600 text-white">For Sale</Badge>
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
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Price:</span>
                      <span className="text-2xl font-bold text-amber-50">{nft.price} ERupee</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Owner:</span>
                      <span className="text-sm font-mono text-gray-300">{nft.owner}</span>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-amber-600 hover:bg-amber-700"
                    onClick={() => {
                      handleBuyNFT(nft.tokenId, nft.price!)
                      playButtonClick()
                    }}
                    disabled={actionLoading === nft.tokenId || !isConnected}
                  >
                    {actionLoading === nft.tokenId ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <ShoppingCart className="h-4 w-4 mr-2" />
                    )}
                    Buy Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my-nfts" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nfts.filter(nft => isOwner(nft)).map((nft) => (
              <Card key={nft.tokenId} className="glass holo-border hover:scale-105 transition-all duration-300" onMouseEnter={playCardHover}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <Badge className={nft.isListed ? "bg-green-600 text-white" : "bg-gray-600 text-white"}>
                      {nft.isListed ? 'Listed' : 'Not Listed'}
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
                    {nft.isListed && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Price:</span>
                        <span className="text-xl font-bold text-amber-50">{nft.price} ERupee</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    {!nft.isListed ? (
                      <div className="space-y-2">
                        <Input
                          placeholder="Enter price in ERupee"
                          value={listingPrice}
                          onChange={(e) => setListingPrice(e.target.value)}
                          className="bg-gray-900/50 border-gray-600 text-amber-50"
                        />
                        <Button
                          className="w-full bg-amber-600 hover:bg-amber-700"
                          onClick={() => {
                            handleListNFT(nft.tokenId, listingPrice)
                            playButtonClick()
                          }}
                          disabled={!listingPrice || actionLoading === nft.tokenId}
                        >
                          {actionLoading === nft.tokenId ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <DollarSign className="h-4 w-4 mr-2" />
                          )}
                          List for Sale
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full border-red-500/30 text-red-500 hover:bg-red-500/10"
                        onClick={() => {
                          handleCancelListing(nft.tokenId)
                          playButtonClick()
                        }}
                        disabled={actionLoading === nft.tokenId}
                      >
                        {actionLoading === nft.tokenId ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Clock className="h-4 w-4 mr-2" />
                        )}
                        Cancel Listing
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {!isConnected && (
        <Alert className="border-yellow-500/30">
          <AlertCircle className="h-4 w-4 text-yellow-500" />
          <AlertDescription className="text-yellow-400">
            Please connect your wallet to buy, sell, or manage land NFTs
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
