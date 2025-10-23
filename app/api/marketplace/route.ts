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
  "function nextTokenId() public view returns (uint256)",
  "function transferFrom(address from, address to, uint256 tokenId) public",
  "function updateLandData(uint256 tokenId, bool listed, uint256 price) public"
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
    
    // Check if contract address is valid
    if (!ERUPEE_DUMMY_CONTRACT_ADDRESS || ERUPEE_DUMMY_CONTRACT_ADDRESS === 'your_erupee_contract_address') {
      console.warn('ERupee contract address not configured, returning mock balance')
      return '9999979990.0'
    }
    
    // First check if contract exists by trying to get code
    const code = await provider.getCode(ERUPEE_DUMMY_CONTRACT_ADDRESS)
    if (!code || code === '0x') {
      console.warn('No contract found at ERupee address, returning mock balance')
      return '9999979990.0'
    }
    
    const contract = new ethers.Contract(ERUPEE_DUMMY_CONTRACT_ADDRESS, ERUPEE_ABI, provider)
    
    // Add timeout to prevent hanging
    const balance = await Promise.race([
      contract.balanceOf(address),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Contract call timeout')), 10000)
      )
    ]) as bigint
    
        return ethers.formatEther(balance)
  } catch (error) {
    console.error('Error fetching ERupee balance:', error)
    // Return mock balance for demo purposes instead of throwing
    return '9999979990.0'
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
 * Get all listed NFTs from the marketplace
 */
async function getAllListedNFTs(): Promise<any[]> {
  try {
    const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL)
    const contract = new ethers.Contract(LAND_NFT_CONTRACT_ADDRESS, LAND_NFT_ABI, provider)
    
    // Get the next token ID to know how many NFTs exist
    const nextTokenId = await contract.nextTokenId()
    const totalNFTs = Number(nextTokenId)
    
    const listedNFTs = []
    
    // Check each token ID to see if it's listed
    for (let i = 0; i < totalNFTs; i++) {
      try {
        const landData = await contract.getLandDetails(i)
        if (landData.listed) {
          // Fetch metadata
          const tokenURI = await contract.tokenURI(i)
          let metadata = null
          
          try {
            const response = await fetch(tokenURI)
            metadata = await response.json()
          } catch (error) {
            console.error(`Error fetching metadata for token ${i}:`, error)
          }
          
          listedNFTs.push({
            tokenId: i.toString(),
            owner: landData.currentOwner,
            price: ethers.formatEther(landData.price),
            isListed: landData.listed,
            coordinates: landData.coordinates,
            documentURI: landData.documentURI,
            metadata
          })
        }
      } catch (error) {
        // Token doesn't exist or other error, skip
        continue
      }
    }
    
    return listedNFTs
  } catch (error) {
    console.error('Error fetching listed NFTs:', error)
    return []
  }
}

/**
 * Get all NFTs (both listed and unlisted) for a specific user
 */
async function getUserNFTs(userAddress: string): Promise<any[]> {
  try {
    const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL)
    const contract = new ethers.Contract(LAND_NFT_CONTRACT_ADDRESS, LAND_NFT_ABI, provider)
    
    // Get the next token ID to know how many NFTs exist
    const nextTokenId = await contract.nextTokenId()
    const totalNFTs = Number(nextTokenId)
    
    const userNFTs = []
    
    // Check each token ID to see if it's owned by the user
    for (let i = 0; i < totalNFTs; i++) {
      try {
        const landData = await contract.getLandDetails(i)
        if (landData.currentOwner.toLowerCase() === userAddress.toLowerCase()) {
          // Fetch metadata
          const tokenURI = await contract.tokenURI(i)
          let metadata = null
          
          try {
            const response = await fetch(tokenURI)
            metadata = await response.json()
          } catch (error) {
            console.error(`Error fetching metadata for token ${i}:`, error)
          }
          
          userNFTs.push({
            tokenId: i.toString(),
            owner: landData.currentOwner,
            price: landData.listed ? ethers.formatEther(landData.price) : undefined,
            isListed: landData.listed,
            coordinates: landData.coordinates,
            documentURI: landData.documentURI,
            metadata
          })
        }
      } catch (error) {
        // Token doesn't exist or other error, skip
        continue
      }
    }
    
    return userNFTs
  } catch (error) {
    console.error('Error fetching user NFTs:', error)
    return []
  }
}

/**
 * List an NFT for sale
 */
async function listNFTForSale(tokenId: string, price: string, sellerAddress: string): Promise<string> {
  try {
    const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL)
    const privateKey = process.env.PRIVATE_KEY?.trim()
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
 * Buy an NFT using ERupee
 */
async function buyNFTWithERupee(tokenId: string, buyerAddress: string, price: string): Promise<string> {
  try {
    const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL)
    const privateKey = process.env.PRIVATE_KEY?.trim()
    if (!privateKey) {
      throw new Error('Private key not configured')
    }
    const signer = new ethers.Wallet(privateKey, provider)

    // Get the land NFT contract and ERupee contract
    const landContract = new ethers.Contract(LAND_NFT_CONTRACT_ADDRESS, LAND_NFT_ABI, signer)
    const erupeeContract = new ethers.Contract(ERUPEE_DUMMY_CONTRACT_ADDRESS, ERUPEE_ABI, signer)
    
    // Convert price to wei (price is in ERupee)
    const priceInWei = ethers.parseEther(price)
    
    console.log(`Buying NFT ${tokenId} for ${price} ERupee by ${buyerAddress}`)
    
    // First, check if buyer has enough ERupee balance
    const buyerBalance = await erupeeContract.balanceOf(buyerAddress)
    if (buyerBalance < priceInWei) {
      throw new Error('Insufficient ERupee balance')
    }
    
    // Get the seller address from the land contract
    const landData = await landContract.getLandDetails(tokenId)
    const sellerAddress = landData.currentOwner
    
    // Step 1: Transfer ERupee from buyer to seller
    const transferTx = await erupeeContract.transferFrom(buyerAddress, sellerAddress, priceInWei)
    await transferTx.wait()
    console.log('ERupee transferred from buyer to seller')
    
    // Step 2: Transfer the NFT from seller to buyer
    const transferNFTTx = await landContract.transferFrom(sellerAddress, buyerAddress, tokenId)
    await transferNFTTx.wait()
    console.log('NFT transferred from seller to buyer')
    
    // Step 3: Update the land data to mark as not listed
    const updateTx = await landContract.updateLandData(tokenId, false, 0)
    await updateTx.wait()
    console.log('Land data updated')
    
    return transferTx.hash
  } catch (error) {
    console.error('Error buying NFT with ERupee:', error)
    throw new Error('Failed to buy NFT with ERupee')
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

      case 'listed-nfts':
        const listedNFTs = await getAllListedNFTs()
        return NextResponse.json({
          success: true,
          data: { nfts: listedNFTs }
        })

      case 'user-nfts':
        if (!address) {
          return NextResponse.json(
            { success: false, message: 'Address is required' },
            { status: 400 }
          )
        }
        const userNFTs = await getUserNFTs(address)
        return NextResponse.json({
          success: true,
          data: { nfts: userNFTs }
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
        const buyTxHash = await buyNFTWithERupee(tokenId, buyerAddress, price)
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
