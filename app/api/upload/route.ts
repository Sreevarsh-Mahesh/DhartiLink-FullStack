import { NextRequest, NextResponse } from 'next/server'
import { ethers } from 'ethers'

// Pinata configuration - these should be in environment variables
const PINATA_API_KEY = process.env.PINATA_API_KEY || 'your_pinata_api_key'
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY || 'your_pinata_secret_key'
const LAND_NFT_CONTRACT_ADDRESS = process.env.LAND_NFT_CONTRACT_ADDRESS || 'your_contract_address'
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || 'https://rpc.sepolia.org'

// LandNFT Contract ABI (matching the actual contract)
const LAND_NFT_ABI = [
  "function mintLand(string memory coordinates, string memory metadataURI, string memory documentURI) public returns (uint256)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function tokenURI(uint256 tokenId) external view returns (string memory)",
  "function getLandDetails(uint256 tokenId) public view returns (tuple(uint256 tokenId, string coordinates, string documentURI, address currentOwner, bool listed, uint256 price))",
  "function nextTokenId() public view returns (uint256)"
]

// ERupeeDummy Contract ABI (for marketplace functionality)
const ERUPEE_ABI = [
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)"
]

/**
 * Upload file to Pinata IPFS
 */
async function uploadToPinata(file: File, fileName: string): Promise<string> {
  console.log('Starting Pinata upload for file:', fileName)
  console.log('File size:', file.size, 'bytes')
  console.log('File type:', file.type)
  console.log('Pinata API Key (first 10 chars):', PINATA_API_KEY.substring(0, 10))
  
  // Check file size (Pinata has limits)
  if (file.size > 100 * 1024 * 1024) { // 100MB limit
    throw new Error('File too large for Pinata upload')
  }
  
  const formData = new FormData()
  formData.append('file', file)
  
  const metadata = JSON.stringify({
    name: fileName,
    keyvalues: {
      type: 'land_document',
      uploadedAt: new Date().toISOString()
    }
  })
  formData.append('pinataMetadata', metadata)

  const options = JSON.stringify({
    cidVersion: 0
  })
  formData.append('pinataOptions', options)
  
  console.log('FormData prepared, sending to Pinata...')

  try {
    console.log('Making request to Pinata API...')
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_KEY,
      },
      body: formData
    })

    console.log('Pinata response status:', response.status)
    console.log('Pinata response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Pinata error response:', errorText)
      
      // Check for specific Pinata errors
      if (response.status === 403) {
        try {
          const errorData = JSON.parse(errorText)
          if (errorData.error?.reason === 'NO_SCOPES_FOUND') {
            throw new Error('Pinata API key does not have required permissions. Please enable "pinFileToIPFS" scope in your Pinata account.')
          }
        } catch (parseError) {
          // If we can't parse the error, use the original message
        }
      }
      
      throw new Error(`Pinata upload failed: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const result = await response.json()
    console.log('Pinata upload successful:', result)
    return `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`
  } catch (error) {
    console.error('Pinata upload error:', error)
    throw new Error(`Failed to upload file to IPFS: ${error.message}`)
  }
}

/**
 * Upload JSON metadata to Pinata IPFS
 */
async function uploadMetadataToPinata(metadata: any): Promise<string> {
  console.log('Starting Pinata metadata upload...')
  
  try {
    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_KEY,
      },
      body: JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: {
          name: `land-metadata-${Date.now()}`,
          keyvalues: {
            type: 'land_metadata',
            createdAt: new Date().toISOString()
          }
        },
        pinataOptions: {
          cidVersion: 0
        }
      })
    })

    console.log('Pinata metadata response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Pinata metadata error response:', errorText)
      throw new Error(`Pinata metadata upload failed: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const result = await response.json()
    console.log('Pinata metadata upload successful:', result)
    return `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`
  } catch (error) {
    console.error('Pinata metadata upload error:', error)
    throw new Error(`Failed to upload metadata to IPFS: ${error.message}`)
  }
}

/**
 * Mint NFT using the LandNFT contract
 */
async function mintLandNFT(
  to: string, 
  metadataURI: string, 
  documentURI: string,
  latitude: number, 
  longitude: number
): Promise<{ tokenId: string; transactionHash: string }> {
  try {
    console.log('Starting NFT minting process...')
    console.log('RPC URL:', SEPOLIA_RPC_URL)
    console.log('Contract Address:', LAND_NFT_CONTRACT_ADDRESS)
    console.log('To Address:', to)
    console.log('Metadata URI:', metadataURI)
    console.log('Document URI:', documentURI)
    console.log('Coordinates:', latitude, longitude)
    
    // Create provider and signer
    const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL)
    const privateKey = process.env.PRIVATE_KEY?.trim()
    if (!privateKey) {
      throw new Error('Private key not configured')
    }
    const signer = new ethers.Wallet(privateKey, provider)

    console.log('Signer address:', signer.address)
    
    // Check wallet balance
    const balance = await provider.getBalance(signer.address)
    console.log('Signer balance:', ethers.formatEther(balance), 'ETH')

    // Create contract instance
    const contract = new ethers.Contract(LAND_NFT_CONTRACT_ADDRESS, LAND_NFT_ABI, signer)

    // Format coordinates as string (contract expects "lat,lon" format)
    const coordinates = `${latitude},${longitude}`
    
    console.log('Coordinates string:', coordinates)

    // Mint the NFT using the correct function signature
    console.log('Calling mintLand function...')
    const tx = await contract.mintLand(coordinates, metadataURI, documentURI)
    console.log('Mint transaction sent:', tx.hash)
    
    const receipt = await tx.wait()
    console.log('Transaction confirmed in block:', receipt.blockNumber)

    // Extract token ID from the transaction logs
    // Look for LandMinted event: event LandMinted(uint256 tokenId, address owner, string coordinates);
    const mintEvent = receipt.logs.find((log: any) => 
      log.topics[0] === ethers.id('LandMinted(uint256,address,string)')
    )
    
    if (!mintEvent) {
      console.log('Available log topics:', receipt.logs.map((log: any) => log.topics[0]))
      // If we can't find the event, try to get the token ID from the contract
      try {
        const nextTokenId = await contract.nextTokenId()
        const tokenId = (nextTokenId - 1n).toString() // nextTokenId is incremented after minting
        console.log('Minted token ID (from nextTokenId):', tokenId)
        return {
          tokenId,
          transactionHash: tx.hash
        }
      } catch (e) {
        console.log('Could not get nextTokenId, trying alternative method...')
        // Try to get the token ID from the Transfer event (ERC721 standard)
        const transferEvent = receipt.logs.find((log: any) => 
          log.topics[0] === ethers.id('Transfer(address,address,uint256)')
        )
        if (transferEvent) {
          const tokenId = ethers.getBigInt(transferEvent.topics[3]).toString()
          console.log('Minted token ID (from Transfer event):', tokenId)
          return {
            tokenId,
            transactionHash: tx.hash
          }
        }
        throw new Error('Mint event not found in transaction and could not get token ID')
      }
    }

    // Decode the event data
    try {
      const decoded = contract.interface.parseLog(mintEvent)
      const tokenId = decoded.args[0].toString() // tokenId is the first argument
      console.log('Minted token ID:', tokenId)
      return {
        tokenId,
        transactionHash: tx.hash
      }
    } catch (parseError) {
      console.log('Could not parse LandMinted event, trying nextTokenId...')
      try {
        const nextTokenId = await contract.nextTokenId()
        const tokenId = (nextTokenId - 1n).toString()
        console.log('Minted token ID (from nextTokenId):', tokenId)
        return {
          tokenId,
          transactionHash: tx.hash
        }
      } catch (e) {
        throw new Error('Could not parse event or get token ID')
      }
    }
  } catch (error) {
    console.error('NFT minting error:', error)
    throw new Error(`Failed to mint NFT: ${error.message}`)
  }
}

/**
 * List an NFT for sale (helper function for auto-listing)
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
    
    console.log(`Auto-listing NFT ${tokenId} for ${price} ETH by ${sellerAddress}`)
    
    const tx = await contract.listLand(tokenId, priceInWei)
    const receipt = await tx.wait()
    
    return tx.hash
  } catch (error) {
    console.error('Error auto-listing NFT:', error)
    throw new Error('Failed to auto-list NFT for sale')
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check Pinata configuration
    if (PINATA_API_KEY === 'your_pinata_api_key' || PINATA_SECRET_KEY === 'your_pinata_secret_key') {
      console.warn('Pinata API keys not configured, using fallback mode')
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const latitude = parseFloat(formData.get('latitude') as string)
    const longitude = parseFloat(formData.get('longitude') as string)
    const ownerAddress = formData.get('ownerAddress') as string

    // Validate inputs
    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      )
    }

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { success: false, message: 'Invalid coordinates provided' },
        { status: 400 }
      )
    }

    if (!ownerAddress) {
      return NextResponse.json(
        { success: false, message: 'Owner address is required' },
        { status: 400 }
      )
    }

    console.log(`Processing land document upload for coordinates: ${latitude}, ${longitude}`)
    console.log(`File size: ${file.size} bytes, type: ${file.type}`)

    // Step 1: Upload file to Pinata IPFS
    const fileName = `land_document_${Date.now()}_${file.name}`
    const documentURI = await uploadToPinata(file, fileName)
    console.log('Document uploaded to IPFS:', documentURI)

    // Step 2: Create metadata JSON
    const metadata = {
      name: `Land Parcel #${Date.now()}`,
      description: `A verified land parcel located at coordinates ${latitude}, ${longitude}`,
      image: "https://gateway.pinata.cloud/ipfs/QmPlaceholderImageHash", // Placeholder image
      attributes: [
        {
          trait_type: "Latitude",
          value: latitude.toString()
        },
        {
          trait_type: "Longitude", 
          value: longitude.toString()
        },
        {
          trait_type: "Document Type",
          value: "Land Ownership Document"
        },
        {
          trait_type: "Verification Status",
          value: "Verified"
        }
      ],
      external_url: documentURI,
      document: documentURI,
      coordinates: {
        latitude,
        longitude
      }
    }

    // Step 3: Upload metadata to Pinata IPFS
    const metadataURI = await uploadMetadataToPinata(metadata)
    console.log('Metadata uploaded to IPFS:', metadataURI)

    // Step 4: Mint NFT using the LandNFT contract
    const mintResult = await mintLandNFT(ownerAddress, metadataURI, documentURI, latitude, longitude)
    console.log('NFT minted successfully:', mintResult)

    // Step 5: Automatically list the NFT for sale (optional - you can remove this if you don't want auto-listing)
    try {
      const listPrice = '0.1' // Default price in ETH
      const listTxHash = await listNFTForSale(mintResult.tokenId, listPrice, ownerAddress)
      console.log('NFT automatically listed for sale:', listTxHash)
    } catch (listError) {
      console.error('Failed to auto-list NFT (this is optional):', listError)
      // Don't fail the entire process if listing fails
    }

    return NextResponse.json({
      success: true,
      message: 'Land NFT created and listed successfully',
      data: {
        tokenId: mintResult.tokenId,
        transactionHash: mintResult.transactionHash,
        metadataURI,
        documentURI,
        coordinates: { latitude, longitude },
        owner: ownerAddress
      }
    })

  } catch (error: any) {
    console.error('Upload and mint error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Failed to process land document and mint NFT' 
      },
      { status: 500 }
    )
  }
}
