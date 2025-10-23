'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin } from 'lucide-react'
import { usePurchasedLands } from '@/contexts/purchased-lands-context'
import { useWalletContext } from '@/contexts/wallet-context'
import { useSoundManager } from '@/components/sound-manager'

export default function PortfolioMapSection() {
  const { purchasedLands } = usePurchasedLands()
  const { account } = useWalletContext()
  const { playButtonClick, playCardHover } = useSoundManager()

  const handleLandClick = (landId: string) => {
    playButtonClick()
    // Simple click handler without map functionality
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="glass holo-border" onMouseEnter={playCardHover}>
          <CardHeader>
            <CardTitle className="text-blue-50">Total Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-50">{purchasedLands.length}</div>
            <p className="text-sm text-gray-400">Land parcels owned</p>
          </CardContent>
        </Card>
        
        <Card className="glass holo-border" onMouseEnter={playCardHover}>
          <CardHeader>
            <CardTitle className="text-blue-50">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-50">₹{purchasedLands.length * 100000}</div>
            <p className="text-sm text-gray-400">Current market value</p>
          </CardContent>
        </Card>
        
        <Card className="glass holo-border" onMouseEnter={playCardHover}>
          <CardHeader>
            <CardTitle className="text-blue-50">Profit/Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">+₹{purchasedLands.length * 100000}</div>
            <p className="text-sm text-gray-400">100% profit (Free acquisition!)</p>
          </CardContent>
        </Card>
      </div>

      {/* Your Properties List */}
      <Card className="glass holo-border">
        <CardHeader>
          <CardTitle className="text-blue-50">Your Properties</CardTitle>
        </CardHeader>
        <CardContent>
          {purchasedLands.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">No properties in your portfolio yet</p>
              <p className="text-sm text-gray-500">Start by purchasing land from the marketplace</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {purchasedLands.map((land, index) => (
                <div 
                  key={land.id} 
                  className="p-4 bg-gray-900/30 rounded-lg border border-gray-700 hover:border-blue-500/50 transition-colors cursor-pointer"
                  onClick={() => handleLandClick(land.id)}
                  onMouseEnter={playCardHover}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-blue-50 font-semibold text-sm">{land.title}</h4>
                    <Badge className="bg-green-600 text-xs">Owned</Badge>
                  </div>
                  <p className="text-xs text-gray-400 mb-2 line-clamp-2">{land.description}</p>
                  <p className="text-xs text-gray-500 mb-2">
                    <MapPin className="h-3 w-3 inline mr-1" />
                    {land.area} • {land.location}
                  </p>
                  <p className="text-xs text-gray-500 mb-2">
                    Land ID: {land.id}
                  </p>
                  <p className="text-xs text-gray-500 mb-2">
                    Purchased: {land.purchaseDate}
                  </p>
                  <p className="text-xs text-gray-500 mb-3">
                    Owner: {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'You'}
                  </p>
                  <Button 
                    size="sm" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-xs"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleLandClick(land.id)
                    }}
                  >
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  )
}
