'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useWalletContext } from '@/contexts/wallet-context'
import { PurchaseSuccess } from '@/components/purchase-success'
import DhartiPaySuccess from '@/components/dharti-pay-success'
import { Landmark, Send, AlertCircle, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface PaymentModalProps {
  landId: string
  landTitle: string
  price: string
  sellerAddress: string
  children: React.ReactNode
  onPurchaseSuccess?: () => void
}

export function PaymentModal({ 
  landId, 
  landTitle, 
  price, 
  sellerAddress, 
  children,
  onPurchaseSuccess
}: PaymentModalProps) {
  const { isConnected, account, sendTransaction, signMessage } = useWalletContext()
  const [isOpen, setIsOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [message, setMessage] = useState('')
  const [txHash, setTxHash] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showDhartiPay, setShowDhartiPay] = useState(false)

  const handlePayment = async () => {
    if (!isConnected || !account) {
      toast.error('Please connect your wallet first')
      return
    }

    setIsProcessing(true)
    try {
      // Sign the land purchase message
      const purchaseMessage = `I agree to purchase land ${landId} (${landTitle}) for ${price} LT`
      const signature = await signMessage(purchaseMessage)
      
      if (!signature) {
        throw new Error('Failed to sign transaction')
      }

      // Send the payment transaction
      const hash = await sendTransaction(sellerAddress, price)
      
      if (hash) {
        setTxHash(hash)
        toast.success('Transaction successful!')
        toast.success(`Transaction Hash: ${hash}`)
        // Close the modal first
        setIsOpen(false)
        // Show DhartiPay animation
        setShowDhartiPay(true)
      } else {
        throw new Error('Transaction failed')
      }
    } catch (error: any) {
      console.error('Payment failed:', error)
      toast.error(error.message || 'Payment failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    setTxHash(null)
    setMessage('')
  }

  // Show DhartiPay animation if payment was successful
  if (showDhartiPay) {
    return (
      <DhartiPaySuccess 
        onComplete={() => {
          setShowDhartiPay(false)
          setShowSuccess(true)
          if (onPurchaseSuccess) {
            onPurchaseSuccess()
          }
        }} 
      />
    )
  }

  // Show success page if transaction was successful
  if (showSuccess) {
    return <PurchaseSuccess landTitle={landTitle} landId={landId} />
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Landmark className="h-5 w-5" />
            Land Purchase Payment
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Land Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Land ID:</span>
                <span className="font-mono">{landId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Title:</span>
                <span className="text-right">{landTitle}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Price:</span>
                <span className="font-mono font-semibold">{price} LT</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Seller:</span>
                <span className="font-mono text-xs">
                  {sellerAddress.slice(0, 6)}...{sellerAddress.slice(-4)}
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Label htmlFor="message">Additional Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Add any additional notes for this transaction..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          {!isConnected && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please connect your wallet to proceed with the payment.
              </AlertDescription>
            </Alert>
          )}

          {txHash && (
            <Alert className="border-green-500/50 bg-green-500/10">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="text-green-500 font-medium">Payment Successful!</p>
                  <p className="text-xs font-mono break-all">
                    TX: {txHash}
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              disabled={!isConnected || isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                'Processing...'
              ) : (
                <>
                  <Send className="h-4 w-4 mr-1" />
                  Pay {price} LT
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
