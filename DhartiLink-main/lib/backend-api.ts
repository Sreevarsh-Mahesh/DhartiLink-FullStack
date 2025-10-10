// Backend API integration for DhartiLINK frontend
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'

export interface LandListing {
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

export interface LandMetadata {
  name: string
  description: string
  size: string
  coordinates: string
  imageUrl: string
}

export interface TokenBalance {
  balance: string
  symbol: string
  decimals: number
}

export interface PurchaseResult {
  success: boolean
  transactionHash?: string
  error?: string
}

class BackendAPI {
  private baseURL: string

  constructor() {
    this.baseURL = BACKEND_URL
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`API Error: ${response.status} - ${error}`)
    }

    return response.json()
  }

  // Token Balance API
  async getTokenBalance(address: string): Promise<{ balance: string; symbol: string; decimals: number }> {
    const response = await this.request<{ success: boolean; data: TokenBalance }>(`/api/tokens/balance/${address}`)
    return response.data
  }

  // Land Marketplace API
  async getLandListings(): Promise<LandListing[]> {
    const response = await this.request<{ success: boolean; data: { listings: any[] } }>('/api/land/listings')
    return response.data.listings.map(listing => ({
      id: listing.tokenId,
      title: listing.metadata.name,
      description: listing.metadata.description,
      price: listing.price,
      area: `${(Number(listing.metadata.size) / 4047).toFixed(1)} acres`, // Convert sqm to acres
      location: 'Chennai, Tamil Nadu',
      seller: listing.seller,
      sellerName: 'Property Owner', // We don't have seller names in the contract
      listedDate: new Date(Number(listing.createdAt) * 1000).toISOString().split('T')[0],
      imageUrl: listing.metadata.imageUrl
    }))
  }

  async getLandListing(tokenId: string): Promise<LandListing> {
    return this.request<LandListing>(`/api/land/listings/${tokenId}`)
  }

  // Land NFT API
  async mintLandNFT(to: string, uri: string, metadata: LandMetadata): Promise<{ tokenId: string }> {
    return this.request<{ tokenId: string }>('/api/land/mint', {
      method: 'POST',
      body: JSON.stringify({ to, uri, metadata }),
    })
  }

  async listLand(tokenId: string, price: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/api/land/list', {
      method: 'POST',
      body: JSON.stringify({ tokenId, price }),
    })
  }

  async purchaseLand(tokenId: string): Promise<PurchaseResult> {
    try {
      return await this.request<PurchaseResult>('/api/land/purchase', {
        method: 'POST',
        body: JSON.stringify({ tokenId }),
      })
    } catch (error: any) {
      // Check for specific error messages
      if (error.message && error.message.includes('Cannot buy your own land')) {
        throw new Error('You cannot purchase your own land. This land is already yours!')
      }
      throw error
    }
  }

  // Health Check
  async healthCheck(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/health')
  }

  // Land Verification API
  async verifyLandOwnership(landId: string, ownerAddress: string): Promise<{ verified: boolean; owner?: string }> {
    return this.request<{ verified: boolean; owner?: string }>('/api/land/verify', {
      method: 'POST',
      body: JSON.stringify({ landId, ownerAddress }),
    })
  }

  // Portfolio API
  async getUserPortfolio(address: string): Promise<{
    totalProperties: number
    totalValue: string
    profitLoss: string
    properties: LandListing[]
  }> {
    return this.request<{
      totalProperties: number
      totalValue: string
      profitLoss: string
      properties: LandListing[]
    }>(`/api/portfolio/${address}`)
  }
}

export const backendAPI = new BackendAPI()
