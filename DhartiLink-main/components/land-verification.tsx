'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useWalletContext } from '@/contexts/wallet-context'
import { Shield, Search, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface LandRecord {
  landId: string
  owner: string
  title: string
  area: string
  location: string
  verified: boolean
  transactionHash: string
  timestamp: string
}

export function LandVerification() {
  const { isConnected, account, signMessage } = useWalletContext()
  const [landId, setLandId] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [landRecord, setLandRecord] = useState<LandRecord | null>(null)
  const [verificationResult, setVerificationResult] = useState<{
    verified: boolean
    signature: string | null
  } | null>(null)

  // Mock land records - in a real app, this would come from a blockchain or API
  const mockLandRecords: LandRecord[] = [
    {
      landId: 'LAND001',
      owner: '0x742d35Cc6634C0532925a3b8D0C4C4C4C4C4C4C4',
      title: 'Agricultural Plot - Sector 12',
      area: '2.5 acres',
      location: 'Delhi, India',
      verified: true,
      transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      timestamp: '2024-01-15T10:30:00Z'
    },
    {
      landId: 'LAND002',
      owner: '0x8ba1f109551bD432803012645Hac136c4c4c4c4c4',
      title: 'Residential Plot - Block A',
      area: '0.75 acres',
      location: 'Mumbai, India',
      verified: true,
      transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      timestamp: '2024-01-20T14:45:00Z'
    }
  ]

  const handleSearch = async () => {
    if (!landId.trim()) {
      toast.error('Please enter a Land ID')
      return
    }

    setIsSearching(true)
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const record = mockLandRecords.find(r => r.landId === landId.toUpperCase())
      setLandRecord(record || null)
      
      if (!record) {
        toast.error('Land record not found')
      }
    } catch (error) {
      toast.error('Failed to search land record')
    } finally {
      setIsSearching(false)
    }
  }

  const handleVerifyOwnership = async () => {
    if (!isConnected || !account) {
      toast.error('Please connect your wallet to verify ownership')
      return
    }

    if (!landRecord) {
      toast.error('No land record to verify')
      return
    }

    try {
      const verificationMessage = `I verify ownership of land ${landRecord.landId} (${landRecord.title})`
      const signature = await signMessage(verificationMessage)
      
      if (signature) {
        setVerificationResult({
          verified: true,
          signature
        })
        toast.success('Ownership verified successfully!')
      } else {
        setVerificationResult({
          verified: false,
          signature: null
        })
        toast.error('Failed to verify ownership')
      }
    } catch (error) {
      setVerificationResult({
        verified: false,
        signature: null
      })
      toast.error('Verification failed')
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <Card className="glass holo-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Land Ownership Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="landId">Land ID</Label>
          <div className="flex gap-2">
            <Input
              id="landId"
              placeholder="Enter Land ID (e.g., LAND001)"
              value={landId}
              onChange={(e) => setLandId(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button 
              onClick={handleSearch} 
              disabled={isSearching}
              className="px-4"
            >
              {isSearching ? (
                'Searching...'
              ) : (
                <>
                  <Search className="h-4 w-4 mr-1" />
                  Search
                </>
              )}
            </Button>
          </div>
        </div>

        {landRecord && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Land Record Found</CardTitle>
                  <Badge variant={landRecord.verified ? "default" : "destructive"}>
                    {landRecord.verified ? "Verified" : "Unverified"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Land ID:</span>
                    <p className="font-mono">{landRecord.landId}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Area:</span>
                    <p>{landRecord.area}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Title:</span>
                    <p>{landRecord.title}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Location:</span>
                    <p>{landRecord.location}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Owner:</span>
                    <p className="font-mono text-xs">{formatAddress(landRecord.owner)}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Transaction Hash:</span>
                    <p className="font-mono text-xs break-all">{landRecord.transactionHash}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Timestamp:</span>
                    <p className="text-xs">{formatTimestamp(landRecord.timestamp)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {isConnected && (
              <Button 
                onClick={handleVerifyOwnership}
                className="w-full"
                disabled={!account}
              >
                <Shield className="h-4 w-4 mr-1" />
                Verify Ownership
              </Button>
            )}

            {verificationResult && (
              <Alert className={verificationResult.verified ? "border-green-500/50 bg-green-500/10" : "border-red-500/50 bg-red-500/10"}>
                {verificationResult.verified ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <AlertDescription>
                  <div className="space-y-1">
                    <p className={verificationResult.verified ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
                      {verificationResult.verified ? "Ownership Verified!" : "Verification Failed"}
                    </p>
                    {verificationResult.signature && (
                      <p className="text-xs font-mono break-all">
                        Signature: {verificationResult.signature}
                      </p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {!isConnected && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Connect your wallet to verify land ownership
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
