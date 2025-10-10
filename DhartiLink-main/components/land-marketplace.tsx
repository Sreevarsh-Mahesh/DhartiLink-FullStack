'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PaymentModal } from '@/components/payment-modal'
import { MapPin, DollarSign, Calendar, User, ShoppingCart, CheckCircle, Loader2 } from 'lucide-react'
import { useSoundManager } from '@/components/sound-manager'
import { usePurchasedLands } from '@/contexts/purchased-lands-context'
import { useWalletContext } from '@/contexts/wallet-context'
import { toast } from 'sonner'
import { backendAPI } from '@/lib/backend-api'

interface LandListing {
  id: string
  title: string
  description: string
  price: string
  area: string
  location: string
  seller: string
  sellerName: string
  listedDate: string
  imageUrl?: string
}

export function LandMarketplace() {
  const { addPurchasedLand, isLandPurchased } = usePurchasedLands()
  const { account } = useWalletContext()
  const [listings, setListings] = useState<LandListing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch real blockchain data
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true)
        const data = await backendAPI.getLandListings()
        setListings(data)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch listings:', err)
        setError('Failed to load land listings')
      } finally {
        setLoading(false)
      }
    }

    fetchListings()
  }, [account])


  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-400" />
          <p className="text-muted-foreground">Loading land listings...</p>
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

  if (listings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No land listings available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => (
          <Card key={listing.id} className="glass holo-border group hover:scale-105 transition-all duration-300">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg font-semibold text-blue-50 group-hover:text-blue-100 transition-colors">
                  {listing.title}
                </CardTitle>
                <Badge variant="secondary" className="bg-blue-600/20 text-blue-200 border-blue-400/30">
                  {listing.price} LT
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {listing.description}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-400" />
                  <span className="text-muted-foreground">{listing.area}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-400" />
                  <span className="text-muted-foreground">
                    {isLandPurchased(listing.id) 
                      ? (account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'You')
                      : listing.sellerName
                    }
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Listed: {listing.listedDate}</span>
                </div>
              </div>

              {isLandPurchased(listing.id) ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Already Purchased</span>
                  </div>
                  <Button 
                    onClick={() => {
                      const portfolioButton = document.querySelector('[data-value="portfolio"]')
                      if (portfolioButton) {
                        (portfolioButton as HTMLElement).click()
                      }
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    View in Portfolio
                  </Button>
                </div>
              ) : (
                <PaymentModal
                  landId={listing.id}
                  landTitle={listing.title}
                  price={listing.price}
                  sellerAddress={listing.seller}
                  onPurchaseSuccess={() => {
                    // Add to purchased lands immediately
                    addPurchasedLand({
                      id: listing.id,
                      title: listing.title,
                      description: listing.description,
                      price: listing.price,
                      area: listing.area,
                      location: listing.location,
                      seller: listing.seller,
                      sellerName: listing.sellerName,
                      purchaseDate: new Date().toISOString().split('T')[0]
                    })
                    
                    // Show success toast
                    toast.success(`Successfully purchased ${listing.title}!`)
                    toast.success('Land added to your portfolio')
                    
                    // Redirect to portfolio tab immediately
                    setTimeout(() => {
                      const portfolioButton = document.querySelector('[data-value="portfolio"]')
                      if (portfolioButton) {
                        (portfolioButton as HTMLElement).click()
                      }
                    }, 100)
                  }}
                >
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Purchase Land
                  </Button>
                </PaymentModal>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {listings.length === 0 && (
        <Card className="glass holo-border">
          <CardContent className="py-12 text-center">
            <div className="space-y-2">
              <MapPin className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-semibold">No Land Listings Available</h3>
              <p className="text-muted-foreground">
                Check back later for new land properties
              </p>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  )
}