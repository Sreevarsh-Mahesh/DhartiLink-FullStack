const API_BASE_URL = 'http://localhost:3001/api';

export interface OwnedNFT {
  tokenId: string;
  name: string;
  description: string;
  size: string;
  coordinates: string;
  imageUrl: string;
  tokenURI: string;
  isListed: boolean;
  listingPrice: string | null;
}

export const portfolioAPI = {
  async getOwnedNFTs(address: string): Promise<OwnedNFT[]> {
    const response = await fetch(`${API_BASE_URL}/land/owned/${address}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch owned NFTs');
    }
    const data = await response.json();
    return data.data;
  },

  async unlistNFT(tokenId: string) {
    const response = await fetch(`${API_BASE_URL}/land/unlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tokenId }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to unlist NFT');
    }
    return data;
  }
};
