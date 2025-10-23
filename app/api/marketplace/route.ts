import { NextRequest, NextResponse } from 'next/server'
import { ethers } from 'ethers'

// Contract addresses and configuration
const LAND_NFT_CONTRACT_ADDRESS = process.env.LAND_NFT_CONTRACT_ADDRESS || 'your_contract_address'
const ERUPEE_DUMMY_CONTRACT_ADDRESS = process.env.ERUPEE_DUMMY_CONTRACT_ADDRESS || 'your_erupee_contract_address'
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || 'https://rpc.sepolia.org'

// LandNFT Contract ABI (for marketplace operations)
const LAND_NFT_ABI = [
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function tokenURI(uint256 tokenId) external view returns (string memory)",
  "function listLand(uint256 tokenId, uint256 price) public",
  "function buyLand(uint256 tokenId) public payable",
  "function getLandDetails(uint256 tokenId) public view returns (tuple(uint256 tokenId, string coordinates, string documentURI, address currentOwner, bool listed, uint256 price))",
  "function nextTokenId() public view returns (uint256)"
]

// ERupeeDummy Contract ABI
const ERUPEE_ABI = [
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)"
]

// Marketplace contract ABI (if you have a separate marketplace contract)
const MARKETPLACE_ABI = [
  "function listItem(uint256 tokenId, uint256 price) external",
  "function buyItem(uint256 tokenId) external payable",
  "function cancelListing(uint256 tokenId) external",
  "function getListing(uint256 tokenId) external view returns (address seller, uint256 price, bool active)"
]

/**
 * Get ERupeeDummy token balance for an address
 */
async function getERupeeBalance(address: string): Promise<string> {
  try {
    const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL)
    const contract = new ethers.Contract(ERUPEE_DUMMY_CONTRACT_ADDRESS, ERUPEE_ABI, provider)
    const balance = await contract.balanceOf(address)
    return ethers.formatEther(balance)
  } catch (error) {
    console.error('Error fetching ERupee balance:', error)
    throw new Error('Failed to fetch ERupee balance')
  }
}

/**
 * Get land NFT details
 */
async function getLandNFTDetails(tokenId: string): Promise<any> {
  try {
    const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL)
    const contract = new ethers.Contract(LAND_NFT_CONTRACT_ADDRESS, LAND_NFT_ABI, provider)
    
    const [owner, tokenURI] = await Promise.all([
      contract.ownerOf(tokenId),
      contract.tokenURI(tokenId)
    ])

    // Fetch metadata from IPFS
    const metadataResponse = await fetch(tokenURI)
    const metadata = await metadataResponse.json()

    return {
      tokenId,
      owner,
      tokenURI,
      metadata
    }
  } catch (error) {
    console.error('Error fetching NFT details:', error)
    throw new Error('Failed to fetch NFT details')
  }
}

/**
 * List an NFT for sale
 */
async function listNFTForSale(tokenId: string, price: string, sellerAddress: string): Promise<string> {
  try {
    const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL)
    const privateKey = process.env.PRIVATE_KEY
    if (!privateKey) {
      throw new Error('Private key not configured')
    }
    const signer = new ethers.Wallet(privateKey, provider)

    const contract = new ethers.Contract(LAND_NFT_CONTRACT_ADDRESS, LAND_NFT_ABI, signer)
    
    // Convert price to wei (price is in ETH)
    const priceInWei = ethers.parseEther(price)
    
    console.log(`Listing NFT ${tokenId} for ${price} ETH by ${sellerAddress}`)
    
    const tx = await contract.listLand(tokenId, priceInWei)
    const receipt = await tx.wait()
    
    return tx.hash
  } catch (error) {
    console.error('Error listing NFT:', error)
    throw new Error('Failed to list NFT for sale')
  }
}

/**
 * Buy an NFT using ETH
 */
async function buyNFTWithETH(tokenId: string, buyerAddress: string, price: string): Promise<string> {
  try {
    const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL)
    const privateKey = process.env.PRIVATE_KEY
    if (!privateKey) {
      throw new Error('Private key not configured')
    }
    const signer = new ethers.Wallet(privateKey, provider)

    const contract = new ethers.Contract(LAND_NFT_CONTRACT_ADDRESS, LAND_NFT_ABI, signer)
    
    // Convert price to wei
    const priceWei = ethers.parseEther(price)
    
    console.log(`Buying NFT ${tokenId} for ${price} ETH by ${buyerAddress}`)
    
    const tx = await contract.buyLand(tokenId, { value: priceWei })
    const receipt = await tx.wait()
    
    return tx.hash
  } catch (error) {
    console.error('Error buying NFT:', error)
    throw new Error('Failed to buy NFT')
  }
}

// GET - Fetch marketplace data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const address = searchParams.get('address')
    const tokenId = searchParams.get('tokenId')

    switch (action) {
      case 'balance':
        if (!address) {
          return NextResponse.json(
            { success: false, message: 'Address is required' },
            { status: 400 }
          )
        }
        const balance = await getERupeeBalance(address)
        return NextResponse.json({
          success: true,
          data: { balance, address }
        })

      case 'nft-details':
        if (!tokenId) {
          return NextResponse.json(
            { success: false, message: 'Token ID is required' },
            { status: 400 }
          )
        }
        const nftDetails = await getLandNFTDetails(tokenId)
        return NextResponse.json({
          success: true,
          data: nftDetails
        })

      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error: any) {
    console.error('Marketplace GET error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch marketplace data' },
      { status: 500 }
    )
  }
}

// POST - Marketplace actions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, tokenId, price, sellerAddress, buyerAddress } = body

    switch (action) {
      case 'list':
        if (!tokenId || !price || !sellerAddress) {
          return NextResponse.json(
            { success: false, message: 'Token ID, price, and seller address are required' },
            { status: 400 }
          )
        }
        const listTxHash = await listNFTForSale(tokenId, price, sellerAddress)
        return NextResponse.json({
          success: true,
          message: 'NFT listed for sale successfully',
          data: { transactionHash: listTxHash, tokenId, price }
        })

      case 'buy':
        if (!tokenId || !buyerAddress || !price) {
          return NextResponse.json(
            { success: false, message: 'Token ID, buyer address, and price are required' },
            { status: 400 }
          )
        }
        const buyTxHash = await buyNFTWithETH(tokenId, buyerAddress, price)
        return NextResponse.json({
          success: true,
          message: 'NFT purchased successfully',
          data: { transactionHash: buyTxHash, tokenId, price }
        })

      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error: any) {
    console.error('Marketplace POST error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to process marketplace action' },
      { status: 500 }
    )
  }
}
