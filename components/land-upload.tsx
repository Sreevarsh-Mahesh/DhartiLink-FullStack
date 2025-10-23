'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Upload, MapPin, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { useWalletContext } from '@/contexts/wallet-context'
import { useSoundManager } from '@/components/sound-manager'

interface UploadResult {
  success: boolean
  message: string
  data?: {
    tokenId: string
    transactionHash: string
    metadataURI: string
    documentURI: string
    coordinates: { latitude: number; longitude: number }
    owner: string
  }
}

export default function LandUpload() {
  const { account, isConnected } = useWalletContext()
  const { playButtonClick, playCardHover } = useSoundManager()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [file, setFile] = useState<File | null>(null)
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [description, setDescription] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleFileSelect = (selectedFile: File) => {
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    if (!allowedTypes.includes(selectedFile.type)) {
      setUploadResult({
        success: false,
        message: 'Please upload a PDF, JPEG, or PNG file'
      })
      return
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setUploadResult({
        success: false,
        message: 'File size must be less than 10MB'
      })
      return
    }

    setFile(selectedFile)
    setUploadResult(null)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const validateCoordinates = (lat: string, lon: string): boolean => {
    const latNum = parseFloat(lat)
    const lonNum = parseFloat(lon)
    
    return !isNaN(latNum) && !isNaN(lonNum) && 
           latNum >= -90 && latNum <= 90 && 
           lonNum >= -180 && lonNum <= 180
  }

  const handleUpload = async () => {
    if (!isConnected || !account) {
      setUploadResult({
        success: false,
        message: 'Please connect your wallet first'
      })
      return
    }

    if (!file) {
      setUploadResult({
        success: false,
        message: 'Please select a file to upload'
      })
      return
    }

    if (!validateCoordinates(latitude, longitude)) {
      setUploadResult({
        success: false,
        message: 'Please enter valid coordinates (latitude: -90 to 90, longitude: -180 to 180)'
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
    setUploadResult(null)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + Math.random() * 20
        })
      }, 500)

      const formData = new FormData()
      formData.append('file', file)
      formData.append('latitude', latitude)
      formData.append('longitude', longitude)
      formData.append('ownerAddress', account)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const result: UploadResult = await response.json()

      if (result.success) {
        setUploadResult(result)
        // Reset form
        setFile(null)
        setLatitude('')
        setLongitude('')
        setDescription('')
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      } else {
        setUploadResult(result)
      }
    } catch (error) {
      console.error('Upload error:', error)
      setUploadResult({
        success: false,
        message: 'Failed to upload file. Please try again.'
      })
    } finally {
      setIsUploading(false)
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toFixed(6))
          setLongitude(position.coords.longitude.toFixed(6))
        },
        (error) => {
          console.error('Error getting location:', error)
          setUploadResult({
            success: false,
            message: 'Unable to get current location. Please enter coordinates manually.'
          })
        }
      )
    } else {
      setUploadResult({
        success: false,
        message: 'Geolocation is not supported by this browser.'
      })
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card className="glass holo-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-50">
            <Upload className="h-6 w-6" />
            Upload Land Document
          </CardTitle>
          <CardDescription>
            Upload your land ownership document and provide coordinates to mint a Land NFT
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload Section */}
          <div className="space-y-4">
            <Label className="text-amber-50">Land Document</Label>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-amber-500 bg-amber-500/10' 
                  : 'border-gray-600 hover:border-amber-500/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileInputChange}
                className="hidden"
              />
              
              {file ? (
                <div className="space-y-2">
                  <FileText className="h-12 w-12 text-amber-500 mx-auto" />
                  <p className="text-amber-50 font-medium">{file.name}</p>
                  <p className="text-sm text-gray-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFile(null)
                      if (fileInputRef.current) {
                        fileInputRef.current.value = ''
                      }
                    }}
                    className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
                  >
                    Remove File
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-amber-50 font-medium">
                      Drag and drop your land document here
                    </p>
                    <p className="text-sm text-gray-400">
                      or click to browse files
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
                  >
                    Choose File
                  </Button>
                  <p className="text-xs text-gray-500">
                    Supported formats: PDF, JPEG, PNG (max 10MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Coordinates Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-amber-50 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Land Coordinates
              </Label>
              <Button
                variant="outline"
                size="sm"
                onClick={getCurrentLocation}
                className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
              >
                Use Current Location
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  placeholder="e.g., 28.6139"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="bg-gray-900/50 border-gray-600 text-amber-50"
                />
                <p className="text-xs text-gray-500">Range: -90 to 90</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  placeholder="e.g., 77.2090"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="bg-gray-900/50 border-gray-600 text-amber-50"
                />
                <p className="text-xs text-gray-500">Range: -180 to 180</p>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add a description for your land parcel..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-gray-900/50 border-gray-600 text-amber-50"
              rows={3}
            />
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-amber-50">Uploading and minting NFT...</span>
                <span className="text-gray-400">{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* Upload Result */}
          {uploadResult && (
            <Alert className={uploadResult.success ? 'border-green-500/30' : 'border-red-500/30'}>
              <div className="flex items-center gap-2">
                {uploadResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                <AlertDescription className={uploadResult.success ? 'text-green-400' : 'text-red-400'}>
                  {uploadResult.message}
                </AlertDescription>
              </div>
              
              {uploadResult.success && uploadResult.data && (
                <div className="mt-4 space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Token ID:</span>
                      <p className="text-amber-50 font-mono">{uploadResult.data.tokenId}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Transaction Hash:</span>
                      <p className="text-amber-50 font-mono text-xs break-all">
                        {uploadResult.data.transactionHash}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400">Coordinates:</span>
                      <p className="text-amber-50">
                        {uploadResult.data.coordinates.latitude}, {uploadResult.data.coordinates.longitude}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400">Owner:</span>
                      <p className="text-amber-50 font-mono text-xs break-all">
                        {uploadResult.data.owner}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(uploadResult.data?.metadataURI, '_blank')}
                      className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
                    >
                      View Metadata
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(uploadResult.data?.documentURI, '_blank')}
                      className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
                    >
                      View Document
                    </Button>
                  </div>
                </div>
              )}
            </Alert>
          )}

          {/* Upload Button */}
          <Button
            onClick={() => {
              handleUpload()
              playButtonClick()
            }}
            disabled={!isConnected || !file || !latitude || !longitude || isUploading}
            className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload & Mint NFT
              </>
            )}
          </Button>

          {!isConnected && (
            <Alert className="border-yellow-500/30">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <AlertDescription className="text-yellow-400">
                Please connect your wallet to upload and mint land NFTs
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Instructions Card */}
      <Card className="glass holo-border" onMouseEnter={playCardHover}>
        <CardHeader>
          <CardTitle className="text-amber-50">How it works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto">
                <span className="text-amber-500 font-bold">1</span>
              </div>
              <h3 className="text-amber-50 font-medium">Upload Document</h3>
              <p className="text-sm text-gray-400">
                Upload your land ownership document (PDF, JPEG, PNG)
              </p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto">
                <span className="text-amber-500 font-bold">2</span>
              </div>
              <h3 className="text-amber-50 font-medium">Provide Coordinates</h3>
              <p className="text-sm text-gray-400">
                Enter the exact coordinates of your land parcel
              </p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto">
                <span className="text-amber-500 font-bold">3</span>
              </div>
              <h3 className="text-amber-50 font-medium">Mint NFT</h3>
              <p className="text-sm text-gray-400">
                Your land is minted as an NFT on the blockchain
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
