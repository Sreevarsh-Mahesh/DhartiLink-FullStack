const { ThirdwebSDK } = require('@thirdweb-dev/sdk')
const { ethers } = require('ethers')

async function deployMarketplace() {
  try {
    // Initialize the SDK with your credentials
    const sdk = new ThirdwebSDK(
      new ethers.Wallet(
        process.env.PRIVATE_KEY,
        ethers.getDefaultProvider('https://ethereum-sepolia-rpc.publicnode.com')
      ),
      {
        clientId: 'ca252327d09be84a4cbe20798109a7da',
        secretKey: 'IRRhCssxCjesWE_kZVUXAzopL_EWBv3lMvI1C-GjD2HA-nrB5shkuejVywfCVlfB41ugfdzp_rV25wu9hG5pQg'
      }
    )

    console.log('Deploying marketplace contract...')

    // Deploy the marketplace contract
    const contractAddress = await sdk.deployer.deployMarketplaceV3({
      name: "DhartiLink Land Marketplace",
      description: "A marketplace for trading land NFTs",
      image: "https://your-image-url.com/marketplace.png",
      primary_sale_recipient: process.env.PRIVATE_KEY ? 
        new ethers.Wallet(process.env.PRIVATE_KEY).address : 
        "0x0000000000000000000000000000000000000000",
      platform_fee_recipient: process.env.PRIVATE_KEY ? 
        new ethers.Wallet(process.env.PRIVATE_KEY).address : 
        "0x0000000000000000000000000000000000000000",
      platform_fee_basis_points: 250, // 2.5%
    })

    console.log('Marketplace deployed at:', contractAddress)
    console.log('Add this to your .env.local:')
    console.log(`NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS=${contractAddress}`)

  } catch (error) {
    console.error('Error deploying marketplace:', error)
  }
}

deployMarketplace()
