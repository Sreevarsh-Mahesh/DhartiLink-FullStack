'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MapPin, Loader2, ShoppingCart, Wallet, DollarSign, Eye, Plus, RefreshCw } from 'lucide-react'
import { useWalletContext } from '@/contexts/wallet-context'
import { useSoundManager } from '@/components/sound-manager'

export default function ThirdwebMarketplace() {
  const { account, isConnected } = useWalletContext()
  const { playButtonClick, playCardHover } = useSoundManager()
  const [activeTab, setActiveTab] = useState('browse')
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [buying, setBuying] = useState<string | null>(null)
  
  // State for different NFT lists
  const [listedNFTs, setListedNFTs] = useState<any[]>([])
  const [userNFTs, setUserNFTs] = useState<any[]>([])

  // Load NFTs from your existing API
  useEffect(() => {
    if (isConnected && account) {
      loadListedNFTs()
      loadUserNFTs()
    }
  }, [isConnected, account])

  const loadListedNFTs = async () => {
    setLoading(true)
    try {
      // Load all user NFTs instead of just listed ones
      const response = await fetch(`/api/marketplace?action=user-nfts&address=${account}`)
      const data = await response.json()
      if (data.success) {
        // Show all NFTs, not just listed ones
        setListedNFTs(data.data.nfts)
      }
    } catch (error) {
      console.error('Error loading NFTs:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUserNFTs = async () => {
    try {
      const response = await fetch(`/api/marketplace?action=user-nfts&address=${account}`)
      const data = await response.json()
      if (data.success) {
        setUserNFTs(data.data.nfts)
      }
    } catch (error) {
      console.error('Error loading user NFTs:', error)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await Promise.all([loadListedNFTs(), loadUserNFTs()])
      playButtonClick()
    } catch (error) {
      console.error('Error refreshing data:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const handleBuyNFT = async (tokenId: string, price: string) => {
    if (!account) {
      alert('Please connect your wallet first')
      return
    }

    setBuying(tokenId)
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
      
      const data = await response.json()
      if (data.success) {
        playButtonClick()
        // Refresh the data
        await handleRefresh()
        alert('NFT purchased successfully!')
      } else {
        alert('Failed to buy NFT: ' + (data.message || data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error buying NFT:', error)
      alert('Error buying NFT: ' + error)
    } finally {
      setBuying(null)
    }
  }

  const handleListNFT = async (tokenId: string, price: string) => {
    if (!account) {
      alert('Please connect your wallet first')
      return
    }

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
      
      const data = await response.json()
      if (data.success) {
        playButtonClick()
        await handleRefresh()
        alert('NFT listed successfully!')
      } else {
        alert('Failed to list NFT: ' + (data.message || data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error listing NFT:', error)
      alert('Error listing NFT: ' + error)
    }
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] bg-gray-900/50 rounded-lg p-8 text-center">
        <ShoppingCart className="h-16 w-16 text-amber-500 mb-6" />
        <h2 className="text-3xl font-bold text-amber-50 mb-4">Connect Your Wallet</h2>
        <p className="text-lg text-gray-400 mb-8">
          Please connect your wallet to explore the Land NFT Marketplace.
        </p>
        <Button className="bg-amber-600 hover:bg-amber-700 flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Connect Wallet
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <Card className="glass holo-border text-center">
        <CardHeader>
          <CardTitle className="text-amber-50 text-3xl flex items-center justify-center gap-3">
            <ShoppingCart className="h-8 w-8" />
            Land NFT Marketplace
          </CardTitle>
          <CardDescription className="text-gray-400">
            Browse and trade land NFTs on the blockchain.
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="browse" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            All Land NFTs ({listedNFTs.length})
          </TabsTrigger>
          <TabsTrigger value="my-nfts" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            My Land NFTs ({userNFTs.length})
          </TabsTrigger>
          <TabsTrigger value="mint" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Mint New Land
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-amber-50">All Land NFTs</h3>
            <Button
              onClick={handleRefresh}
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
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
              <span className="ml-3 text-gray-400">Loading NFTs...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listedNFTs && listedNFTs.length > 0 ? (
                listedNFTs.map((nft) => (
                  <Card 
                    key={nft.tokenId} 
                    className="glass holo-border hover:scale-105 transition-all duration-300"
                    onMouseEnter={playCardHover}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <Badge className={nft.isListed ? "bg-green-600 text-white" : "bg-blue-600 text-white"}>
                          {nft.isListed ? 'For Sale' : 'Available'}
                        </Badge>
                        <Badge variant="outline" className="border-amber-500/30 text-amber-500">
                          Token #{nft.tokenId}
                        </Badge>
                      </div>
                      <CardTitle className="text-amber-50">{nft.metadata?.name || `Land #${nft.tokenId}`}</CardTitle>
                      <CardDescription className="flex items-center gap-1 text-gray-400">
                        <MapPin className="h-4 w-4" />
                        {nft.coordinates || 'Unknown Coordinates'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {nft.metadata?.image && (
                        <img src={nft.metadata.image} alt={nft.metadata.name} className="w-full h-48 object-cover rounded-md mb-2" />
                      )}
                      <p className="text-sm text-gray-400">{nft.metadata?.description || 'Land NFT'}</p>
                      {nft.isListed ? (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Price:</span>
                            <span className="text-amber-50 font-bold">{nft.price} ERupee</span>
                          </div>
                          <Button 
                            className="w-full bg-amber-600 hover:bg-amber-700 flex items-center gap-2"
                            onClick={() => handleBuyNFT(nft.tokenId, nft.price)}
                            disabled={buying === nft.tokenId}
                          >
                            {buying === nft.tokenId ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <DollarSign className="h-4 w-4" />
                            )}
                            Buy Land
                          </Button>
                        </>
                      ) : (
                        <Button 
                          className="w-full bg-green-600 hover:bg-green-700 flex items-center gap-2"
                          onClick={() => {
                            const price = prompt('Enter price in ERupee to list this land:')
                            if (price) handleListNFT(nft.tokenId, price)
                          }}
                        >
                          <DollarSign className="h-4 w-4" />
                          List for Sale
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <MapPin className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-400 mb-2">No Land NFTs Found</h3>
                  <p className="text-gray-500">No NFTs are currently available in this marketplace.</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-nfts" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-amber-50">Your Land NFTs</h3>
            <Button
              onClick={handleRefresh}
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
          </div>

          {userNFTs && userNFTs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userNFTs.map((nft) => (
                <Card 
                  key={nft.tokenId} 
                  className="glass holo-border hover:scale-105 transition-all duration-300"
                  onMouseEnter={playCardHover}
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
                    <CardTitle className="text-amber-50">{nft.metadata?.name || `Land #${nft.tokenId}`}</CardTitle>
                    <CardDescription className="flex items-center gap-1 text-gray-400">
                      <MapPin className="h-4 w-4" />
                      {nft.coordinates || 'Unknown Coordinates'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {nft.metadata?.image && (
                      <img src={nft.metadata.image} alt={nft.metadata.name} className="w-full h-48 object-cover rounded-md mb-2" />
                    )}
                    <p className="text-sm text-gray-400">{nft.metadata?.description || 'Land NFT'}</p>
                    {nft.isListed && nft.price && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Listed Price:</span>
                        <span className="text-amber-50 font-bold">{nft.price} ERupee</span>
                      </div>
                    )}
                    {!nft.isListed && (
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700 flex items-center gap-2"
                        onClick={() => {
                          const price = prompt('Enter price in ERupee:')
                          if (price) handleListNFT(nft.tokenId, price)
                        }}
                      >
                        <DollarSign className="h-4 w-4" />
                        List for Sale
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-400 mb-2">No Land NFTs Found</h3>
              <p className="text-gray-500">You don't own any land NFTs yet. Start by minting your first land!</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="mint" className="space-y-6">
          <div className="text-center py-12">
            <Plus className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-400 mb-2">Mint New Land NFT</h3>
            <p className="text-gray-500 mb-6">Use the upload page to mint new land NFTs with coordinates and documents.</p>
            <Button 
              className="bg-amber-600 hover:bg-amber-700 flex items-center gap-2"
              onClick={() => window.location.href = '/upload'}
            >
              <Plus className="h-4 w-4" />
              Go to Upload Page
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}