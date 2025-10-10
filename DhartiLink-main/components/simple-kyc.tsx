'use client'

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  Camera, 
  CheckCircle, 
  XCircle, 
  FileText,
  ArrowRight
} from 'lucide-react'
import { useSoundManager } from '@/components/sound-manager'
import TitleTransition from '@/components/title-transition'

interface KYCDocument {
  id: string
  type: 'pan' | 'aadhaar'
  file: File | null
  status: 'pending' | 'verified' | 'rejected'
}

export default function SimpleKYC({ onComplete }: { onComplete: () => void }) {
  const { playButtonClick, playCardHover } = useSoundManager()
  const [step, setStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    address: ''
  })
  const [documents, setDocuments] = useState<KYCDocument[]>([
    { id: '1', type: 'pan', file: null, status: 'pending' },
    { id: '2', type: 'aadhaar', file: null, status: 'pending' }
  ])
  const [selfie, setSelfie] = useState<File | null>(null)
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'rejected'>('pending')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLVideoElement>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)

  // Cleanup camera on unmount
  React.useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [cameraStream])

  const documentTypes = {
    pan: { name: 'PAN Card', required: true },
    aadhaar: { name: 'Aadhaar Card', required: true }
  }

  const handleFileUpload = (documentId: string, file: File) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === documentId 
        ? { ...doc, file, status: 'pending' }
        : doc
    ))
    playButtonClick()
  }

  const handleSelfieCapture = async () => {
    try {
      setShowCamera(true)
      playButtonClick()
      
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      })
      
      if (cameraRef.current) {
        cameraRef.current.srcObject = stream
        setCameraStream(stream)
      }
    } catch (error) {
      console.error('Camera access denied:', error)
      const errorMessage = error instanceof Error && error.name === 'NotAllowedError' 
        ? 'Camera access was denied. Please allow camera access in your browser settings and try again.'
        : 'Camera is not available. Please ensure you have a working camera and try again.'
      alert(errorMessage)
      setShowCamera(false)
    }
  }

  const captureSelfie = () => {
    if (cameraRef.current) {
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      canvas.width = cameraRef.current.videoWidth
      canvas.height = cameraRef.current.videoHeight
      context?.drawImage(cameraRef.current, 0, 0)
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' })
          setSelfie(file)
          closeCamera()
          playButtonClick()
        }
      }, 'image/jpeg', 0.8)
    }
  }

  const closeCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
      setCameraStream(null)
    }
    setShowCamera(false)
  }

  const simulateVerification = async () => {
    setIsProcessing(true)
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Simulate verification results (90% success rate)
    const isVerified = Math.random() > 0.1
    
    if (isVerified) {
      setVerificationStatus('verified')
      // Save KYC status to localStorage
      localStorage.setItem('kyc_verified', 'true')
      localStorage.setItem('kyc_data', JSON.stringify({
        ...formData,
        verifiedAt: new Date().toISOString()
      }))
      
      // Wait a moment then redirect
      setTimeout(() => {
        onComplete()
      }, 2000)
    } else {
      setVerificationStatus('rejected')
    }
    
    setIsProcessing(false)
    playButtonClick()
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'rejected': return <XCircle className="w-5 h-5 text-red-500" />
      default: return <div className="w-5 h-5 border-2 border-yellow-500 rounded-full" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    }
  }

  if (verificationStatus === 'verified') {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Background Effects */}
        <div className="holo-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
        
        <div className="flex flex-col items-center justify-center min-h-screen p-6 relative z-10">
          {/* Animated Title Above Card */}
          <div className="mb-8 scale-75">
            <TitleTransition />
          </div>
          
          <Card className="glass holo-border max-w-md w-full text-center">
            <CardContent className="p-8 space-y-6">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
              <div>
                <h2 className="text-2xl font-bold text-green-400 mb-2">KYC Verified!</h2>
                <p className="text-gray-400">Your identity has been successfully verified. Welcome to DhartiLink!</p>
              </div>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                Verified Account
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (verificationStatus === 'rejected') {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Background Effects */}
        <div className="holo-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
        
        <div className="flex flex-col items-center justify-center min-h-screen p-6 relative z-10">
          {/* Animated Title Above Card */}
          <div className="mb-8 scale-75">
            <TitleTransition />
          </div>
          
          <Card className="glass holo-border max-w-md w-full text-center">
            <CardContent className="p-8 space-y-6">
              <XCircle className="w-20 h-20 text-red-500 mx-auto" />
              <div>
                <h2 className="text-2xl font-bold text-red-400 mb-2">Verification Failed</h2>
                <p className="text-gray-400">Please check your documents and try again.</p>
              </div>
              <Button 
                onClick={() => {
                  setVerificationStatus('pending')
                  setStep(1)
                  setFormData({ fullName: '', phoneNumber: '', email: '', address: '' })
                  setDocuments([
                    { id: '1', type: 'pan', file: null, status: 'pending' },
                    { id: '2', type: 'aadhaar', file: null, status: 'pending' }
                  ])
                  setSelfie(null)
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="holo-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
      
      <div className="flex flex-col items-center justify-center min-h-screen p-6 relative z-10">
        {/* Animated Title Above Card */}
        <div className="mb-8 scale-75">
          <TitleTransition />
        </div>
        
        <Card className="glass holo-border max-w-2xl w-full">
          <CardHeader className="text-center">
            <div className="mb-4">
              <h2 className="text-2xl font-semibold text-white">KYC Verification</h2>
            </div>
            <p className="text-gray-400">
              Complete your identity verification to access DhartiLink
            </p>
          </CardHeader>
        
          <CardContent className="space-y-6">
            {/* Step 1: Personal Information */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">
                  Personal Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName" className="text-sm font-medium text-gray-300">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      placeholder="Enter your full name"
                      className="mt-1 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-300">Phone Number *</Label>
                    <Input
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      placeholder="+91 9876543210"
                      className="mt-1 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-gray-300">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="your@email.com"
                      className="mt-1 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address" className="text-sm font-medium text-gray-300">Address *</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Your complete address"
                      className="mt-1 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={() => setStep(2)} 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={!formData.fullName || !formData.phoneNumber || !formData.email || !formData.address}
                >
                  Continue to Documents
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {/* Step 2: Document Upload */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Document Upload</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {documents.map((doc) => (
                    <div key={doc.id} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-white">
                          {documentTypes[doc.type].name}
                          {documentTypes[doc.type].required && <span className="text-red-400 ml-1">*</span>}
                        </h4>
                        {getStatusIcon(doc.status)}
                      </div>
                      
                      <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center hover:border-blue-500 transition-all duration-200 hover:bg-gray-800/20">
                        {doc.file ? (
                          <div className="space-y-2">
                            <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
                            <p className="text-sm text-green-400 font-medium">{doc.file.name}</p>
                            <Badge className={getStatusColor(doc.status)}>
                              {doc.status}
                            </Badge>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                            <p className="text-sm text-gray-400">Click to upload</p>
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) handleFileUpload(doc.id, file)
                              }}
                              className="hidden"
                              ref={fileInputRef}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => fileInputRef.current?.click()}
                              className="bg-gray-800/50 border-gray-600 text-white hover:bg-gray-700 hover:border-blue-500"
                            >
                              Upload Document
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex space-x-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={() => setStep(3)} 
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={!documents.some(doc => doc.file)}
                  >
                    Continue to Selfie
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Selfie Verification */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
                  <Camera className="w-5 h-5" />
                  <span>Selfie Verification</span>
                </h3>
                
                <div className="text-center space-y-4">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 backdrop-blur-sm">
                    <p className="text-sm text-blue-300 font-medium">
                      Take a clear selfie for identity verification. Ensure good lighting and look directly at the camera.
                    </p>
                  </div>

                  {selfie ? (
                    <div className="space-y-4">
                      <div className="relative inline-block">
                        <img 
                          src={URL.createObjectURL(selfie)} 
                          alt="Selfie" 
                          className="w-48 h-48 object-cover rounded-lg border-2 border-gray-600"
                        />
                        <div className="absolute top-2 right-2">
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        </div>
                      </div>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        Selfie Captured
                      </Badge>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {showCamera ? (
                        <div className="space-y-4">
                          <video 
                            ref={cameraRef}
                            autoPlay 
                            className="w-64 h-64 object-cover rounded-lg border-2 border-gray-600 mx-auto"
                          />
                          <div className="flex space-x-4 justify-center">
                            <Button onClick={captureSelfie} className="bg-green-600 hover:bg-green-700">
                              Capture Photo
                            </Button>
                            <Button variant="outline" onClick={closeCamera}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="w-48 h-48 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center mx-auto hover:border-blue-500 transition-colors">
                            <Camera className="w-12 h-12 text-gray-400" />
                          </div>
                          <div className="space-y-2">
                            <Button onClick={handleSelfieCapture} className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-200">
                              Take Selfie
                            </Button>
                            <p className="text-xs text-gray-400 text-center">or</p>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  setSelfie(file)
                                  playButtonClick()
                                }
                              }}
                              className="hidden"
                              id="selfie-upload"
                            />
                            <Button 
                              variant="outline" 
                              onClick={() => document.getElementById('selfie-upload')?.click()}
                              className="w-full bg-gray-800/50 border-gray-600 text-white hover:bg-gray-700 hover:border-blue-500"
                            >
                              Upload Selfie
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep(2)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={simulateVerification} 
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={!selfie || isProcessing}
                  >
                    {isProcessing ? 'Verifying...' : 'Submit for Verification'}
                  </Button>
                </div>
              </div>
            )}

            {/* Processing State */}
            {isProcessing && (
              <div className="text-center space-y-6">
                <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-white">Verifying Your Identity</h3>
                  <p className="text-gray-400">Please wait while we verify your documents...</p>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-4">
                    <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}