'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, MapPin, DollarSign, Calendar, Eye, Navigation } from 'lucide-react'
import Link from 'next/link'
import { useSoundManager } from '@/components/sound-manager'
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

export default function PortfolioPage() {
  const [selectedProperty, setSelectedProperty] = useState<any>(null)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const { playButtonClick, playCardHover, playMapZoom } = useSoundManager()

  // Mock purchased properties data
  const [purchasedProperties, setPurchasedProperties] = useState([
    {
      id: 'TN-CHN-2001',
      title: 'Chennai Tech Park',
      location: 'Chennai, Tamil Nadu',
      area: '2.5 acres',
      purchasePrice: '₹2,50,00,000',
      currentValue: '₹2,75,00,000',
      purchaseDate: '2024-01-15',
      coordinates: [13.0827, 80.2707],
      type: 'Commercial',
      status: 'Owned',
      documents: ['Title Deed', 'Survey Certificate', 'Tax Receipt']
    },
    {
      id: 'KA-BLR-1004',
      title: 'Bangalore IT Hub',
      location: 'Bangalore, Karnataka',
      area: '1.2 acres',
      purchasePrice: '₹1,20,00,000',
      currentValue: '₹1,35,00,000',
      purchaseDate: '2024-02-20',
      coordinates: [12.9716, 77.5946],
      type: 'Residential',
      status: 'Owned',
      documents: ['Title Deed', 'Survey Certificate', 'Tax Receipt']
    }
  ])

  const handlePropertySelect = (property: any) => {
    setSelectedProperty(property)
    setViewMode('map')
    playMapZoom()
  }

  const totalValue = purchasedProperties.reduce((sum, prop) => {
    return sum + parseInt(prop.currentValue.replace(/[₹,]/g, ''))
  }, 0)

  const totalInvestment = purchasedProperties.reduce((sum, prop) => {
    return sum + parseInt(prop.purchasePrice.replace(/[₹,]/g, ''))
  }, 0)

  const profit = totalValue - totalInvestment

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                {profit >= 0 ? 'Gain' : 'Loss'} ({((profit / totalInvestment) * 100).toFixed(2)}%)
              </p>
            </CardContent>
          </Card>
        </div>

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
        {viewMode === 'list' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {purchasedProperties.map((property) => (
              <Card 
                key={property.id} 
                className="glass holo-border hover:scale-105 transition-all duration-300 cursor-pointer"
                onMouseEnter={playCardHover}
                onClick={() => handlePropertySelect(property)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <Badge className="bg-green-600 text-white">
                      {property.status}
                    </Badge>
                    <Badge variant="outline" className="border-amber-500/30 text-amber-500">
                      {property.type}
                    </Badge>
                  </div>
                  <CardTitle className="text-amber-50">{property.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1 text-gray-400">
                    <MapPin className="h-4 w-4" />
                    {property.location}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Area:</span>
                      <span className="text-amber-50 font-semibold">{property.area}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Purchase Price:</span>
                      <span className="text-amber-50 font-bold">{property.purchasePrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Current Value:</span>
                      <span className="text-green-500 font-bold">{property.currentValue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Purchase Date:</span>
                      <span className="text-gray-300">{property.purchaseDate}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-amber-50">Documents:</h4>
                    <div className="flex flex-wrap gap-1">
                      {property.documents.map((doc, index) => (
                        <Badge key={index} variant="outline" className="text-xs border-gray-600 text-gray-300">
                          {doc}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-amber-600 hover:bg-amber-700 flex items-center gap-2"
                    onClick={playButtonClick}
                  >
                    <Eye className="h-4 w-4" />
                    View on Map
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="glass holo-border">
            <CardHeader>
              <CardTitle className="text-amber-50 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Interactive Map
                {selectedProperty && (
                  <Badge variant="outline" className="border-amber-500/30 text-amber-500 ml-auto">
                    {selectedProperty.title}
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
