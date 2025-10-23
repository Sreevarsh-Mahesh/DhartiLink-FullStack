import { ethers } from 'ethers'

// Contract addresses (these should be in environment variables)
export const CONTRACT_ADDRESSES = {
  LAND_NFT: process.env.LAND_NFT_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
  ERUPEE_DUMMY: process.env.ERUPEE_DUMMY_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
  MARKETPLACE: process.env.MARKETPLACE_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000'
}

// RPC URL
export const RPC_URL = process.env.SEPOLIA_RPC_URL || 'https://rpc.sepolia.org'

// LandNFT Contract ABI
export const LAND_NFT_ABI = [
  // ERC-721 Standard functions
  "function name() external view returns (string memory)",
  "function symbol() external view returns (string memory)",
  "function totalSupply() external view returns (uint256)",
  "function tokenByIndex(uint256 index) external view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)",
  "function balanceOf(address owner) external view returns (uint256)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function tokenURI(uint256 tokenId) external view returns (string memory)",
  "function approve(address to, uint256 tokenId) external",
  "function getApproved(uint256 tokenId) external view returns (address)",
  "function setApprovalForAll(address operator, bool approved) external",
  "function isApprovedForAll(address owner, address operator) external view returns (bool)",
  "function transferFrom(address from, address to, uint256 tokenId) external",
  "function safeTransferFrom(address from, address to, uint256 tokenId) external",
  "function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) external",
  
  // LandNFT specific functions
  "function mint(address to, string memory metadataURI, uint256 lat, uint256 lon) external returns (uint256)",
  "function getLandCoordinates(uint256 tokenId) external view returns (uint256 lat, uint256 lon)",
  "function getLandDocument(uint256 tokenId) external view returns (string memory)",
  "function getLandMetadata(uint256 tokenId) external view returns (string memory)",
  
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
  "event ApprovalForAll(address indexed owner, address indexed operator, bool approved)",
  "event LandMinted(address indexed to, uint256 indexed tokenId, uint256 lat, uint256 lon, string metadataURI)"
]

// ERupeeDummy Contract ABI
export const ERUPEE_ABI = [
  // ERC-20 Standard functions
  "function name() external view returns (string memory)",
  "function symbol() external view returns (string memory)",
  "function decimals() external view returns (uint8)",
  "function totalSupply() external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
  
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)"
]

// Marketplace Contract ABI (if you have a separate marketplace contract)
export const MARKETPLACE_ABI = [
  "function listItem(uint256 tokenId, uint256 price) external",
  "function buyItem(uint256 tokenId) external",
  "function cancelListing(uint256 tokenId) external",
  "function getListing(uint256 tokenId) external view returns (address seller, uint256 price, bool active)",
  "function getListings() external view returns (uint256[] memory tokenIds)",
  "function getListingsBySeller(address seller) external view returns (uint256[] memory tokenIds)",
  
  // Events
  "event ItemListed(uint256 indexed tokenId, address indexed seller, uint256 price)",
  "event ItemSold(uint256 indexed tokenId, address indexed buyer, uint256 price)",
  "event ListingCancelled(uint256 indexed tokenId, address indexed seller)"
]

/**
 * Create a contract instance
 */
export function createContract(address: string, abi: any[], provider: ethers.Provider | ethers.Signer) {
  return new ethers.Contract(address, abi, provider)
}

/**
 * Create a provider instance
 */
export function createProvider(): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(RPC_URL)
}

/**
 * Create a signer instance
 */
export function createSigner(privateKey: string): ethers.Wallet {
  const provider = createProvider()
  return new ethers.Wallet(privateKey, provider)
}

/**
 * Get contract instances for common operations
 */
export function getContractInstances(provider: ethers.Provider | ethers.Signer) {
  return {
    landNFT: createContract(CONTRACT_ADDRESSES.LAND_NFT, LAND_NFT_ABI, provider),
    erupeeDummy: createContract(CONTRACT_ADDRESSES.ERUPEE_DUMMY, ERUPEE_ABI, provider),
    marketplace: createContract(CONTRACT_ADDRESSES.MARKETPLACE, MARKETPLACE_ABI, provider)
  }
}

/**
 * Utility function to format coordinates
 */
export function formatCoordinates(lat: number, lon: number): { latInt: number; lonInt: number } {
  return {
    latInt: Math.floor(lat * 1e6), // 6 decimal places precision
    lonInt: Math.floor(lon * 1e6)
  }
}

/**
 * Utility function to parse coordinates from contract
 */
export function parseCoordinates(latInt: bigint, lonInt: bigint): { lat: number; lon: number } {
  return {
    lat: Number(latInt) / 1e6,
    lon: Number(lonInt) / 1e6
  }
}

/**
 * Validate Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return ethers.isAddress(address)
}

/**
 * Validate coordinates
 */
export function isValidCoordinates(lat: number, lon: number): boolean {
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180
}
