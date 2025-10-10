'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Calendar, User, Loader2, Eye, EyeOff, DollarSign } from 'lucide-react'
import { useWalletContext } from '@/contexts/wallet-context'
import { portfolioAPI, OwnedNFT } from '@/lib/portfolio-api'
import { toast } from 'sonner'

export function Portfolio() {
  const { account, isConnected } = useWalletContext()
  const [ownedNFTs, setOwnedNFTs] = useState<OwnedNFT[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch owned NFTs
  useEffect(() => {
    const fetchOwnedNFTs = async () => {
      if (!isConnected || !account) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const data = await portfolioAPI.getOwnedNFTs(account)
        setOwnedNFTs(data)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch owned NFTs:', err)
        setError('Failed to load your portfolio')
      } finally {
        setLoading(false)
      }
    }

    fetchOwnedNFTs()
  }, [isConnected, account])

  const handleUnlist = async (tokenId: string, nftName: string) => {
    try {
      await portfolioAPI.unlistNFT(tokenId)
      toast.success(`${nftName} unlisted successfully!`)
      
      // Refresh the portfolio
      const data = await portfolioAPI.getOwnedNFTs(account!)
      setOwnedNFTs(data)
    } catch (error: any) {
      toast.error(error.message || 'Failed to unlist NFT')
    }
  }

  const formatSize = (sizeInSqm: string) => {
    const sqm = Number(sizeInSqm)
    const acres = (sqm / 4047).toFixed(1)
    return `${acres} acres (${sqm} sqm)`
  }

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-blue-50">Connect Your Wallet</h3>
          <p className="text-muted-foreground">Connect your wallet to view your land portfolio</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-400" />
          <p className="text-muted-foreground">Loading your portfolio...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="space-y-4">
          <p className="text-red-400">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  if (ownedNFTs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-blue-50">No Land NFTs Found</h3>
          <p className="text-muted-foreground">You don't own any land NFTs yet.</p>
          <p className="text-muted-foreground">Visit the marketplace to purchase your first property!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-blue-50">Your Portfolio</h2>
          <p className="text-muted-foreground">Manage your land NFT collection</p>
        </div>
        <Badge variant="outline" className="text-green-400 border-green-400">
          {ownedNFTs.length} NFT{ownedNFTs.length !== 1 ? 's' : ''} Owned
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {ownedNFTs.map((nft) => (
          <Card key={nft.tokenId} className="glass holo-border group hover:scale-105 transition-all duration-300">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg font-semibold text-blue-50 group-hover:text-blue-100 transition-colors">
                  {nft.name}
                </CardTitle>
                <Badge variant={nft.isListed ? "default" : "secondary"} className="ml-2">
                  {nft.isListed ? (
                    <><DollarSign className="w-3 h-3 mr-1" /> Listed</>
                  ) : (
                    <><EyeOff className="w-3 h-3 mr-1" /> Private</>
                  )}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {nft.imageUrl && (
                <div className="aspect-video rounded-lg overflow-hidden">
                  <img 
                    src={nft.imageUrl} 
                    alt={nft.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              )}
              
              <p className="text-sm text-muted-foreground line-clamp-3">
                {nft.description}
              </p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{nft.coordinates}</span>
                </div>
                
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{formatSize(nft.size)}</span>
                </div>
                
                {nft.isListed && nft.listingPrice && (
                  <div className="flex items-center text-green-400 font-semibold">
                    <DollarSign className="w-4 h-4 mr-2" />
                    <span>{nft.listingPrice} LT tokens</span>
                  </div>
                )}
              </div>
              
              <div className="pt-4 border-t border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Token ID: #{nft.tokenId}</span>
                  {nft.isListed ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleUnlist(nft.tokenId, nft.name)}
                      className="text-orange-400 border-orange-400 hover:bg-orange-400/10"
                    >
                      <EyeOff className="w-4 h-4 mr-1" />
                      Unlist
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled
                      className="text-gray-500"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Private
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
