import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Check if environment variables are available
    const envCheck = {
      PINATA_API_KEY: process.env.PINATA_API_KEY ? 'Set' : 'Not Set',
      PINATA_SECRET_KEY: process.env.PINATA_SECRET_KEY ? 'Set' : 'Not Set',
      LAND_NFT_CONTRACT_ADDRESS: process.env.LAND_NFT_CONTRACT_ADDRESS ? 'Set' : 'Not Set',
      ERUPEE_DUMMY_CONTRACT_ADDRESS: process.env.ERUPEE_DUMMY_CONTRACT_ADDRESS ? 'Set' : 'Not Set',
      SEPOLIA_RPC_URL: process.env.SEPOLIA_RPC_URL ? 'Set' : 'Not Set',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ? 'Set' : 'Not Set',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Set' : 'Not Set',
      NEXT_PUBLIC_LAND_NFT_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_LAND_NFT_CONTRACT_ADDRESS ? 'Set' : 'Not Set',
      NEXT_PUBLIC_ERUPEE_DUMMY_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_ERUPEE_DUMMY_CONTRACT_ADDRESS ? 'Set' : 'Not Set',
      NEXT_PUBLIC_SEPOLIA_RPC_URL: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ? 'Set' : 'Not Set',
      NEXT_PUBLIC_THIRDWEB_CLIENT_ID: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID ? 'Set' : 'Not Set',
    }

    // Test Pinata API with current keys
    const pinataTest = await fetch('https://api.pinata.cloud/data/testAuthentication', {
      method: 'GET',
      headers: {
        'pinata_api_key': process.env.PINATA_API_KEY || '',
        'pinata_secret_api_key': process.env.PINATA_SECRET_KEY || ''
      }
    })

    const pinataResult = await pinataTest.json()

    return NextResponse.json({
      success: true,
      environment: envCheck,
      pinataTest: pinataResult,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: {
        PINATA_API_KEY: process.env.PINATA_API_KEY ? 'Set' : 'Not Set',
        PINATA_SECRET_KEY: process.env.PINATA_SECRET_KEY ? 'Set' : 'Not Set',
      }
    })
  }
}
