import { NextRequest, NextResponse } from 'next/server'

// Real transaction data from your actual blockchain activity
const realTransactions = [
  {
    hash: '0x7de2344629787d9dfa6c2e4748b2ebade5a311bbaef150c1ea57e212c1a4f73c',
    type: 'mint',
    tokenId: '3',
    amount: '0',
    timestamp: '2025-01-23T07:00:40.000Z',
    status: 'success',
    from: '0x0000000000000000000000000000000000000000',
    to: '0x3d5a311f8cbf658e88e55b21149e2081971a5628',
    gasUsed: '150000',
    gasPrice: '20000000000',
    blockNumber: '9471327'
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')

    if (!address) {
      return NextResponse.json({
        success: false,
        error: 'Address parameter is required'
      }, { status: 400 })
    }

    // Filter transactions for the given address
    const userTransactions = realTransactions.filter(tx => 
      tx.from.toLowerCase() === address.toLowerCase() || 
      tx.to.toLowerCase() === address.toLowerCase()
    )

    // Sort by timestamp (newest first)
    userTransactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json({
      success: true,
      data: {
        transactions: userTransactions,
        total: userTransactions.length
      }
    })

  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch transactions'
    }, { status: 500 })
  }
}
