'use client'
import React, { useState, useEffect } from 'react'
import { WalletProvider } from '@/contexts/wallet-context'
import { usePurchasedLands } from '@/contexts/purchased-lands-context'
import { useRouter } from 'next/navigation'

export default function WalletPage() {
  const router = useRouter()
  const { addPurchasedLand } = usePurchasedLands()
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [tokens, setTokens] = useState<any[]>([])
  const [connectedAccount, setConnectedAccount] = useState<string | null>(null)
  const [ethBalance, setEthBalance] = useState<string>('0')
  const [isLoadingBalance, setIsLoadingBalance] = useState(false)

  // Check if MetaMask is already connected on page load
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        try {
          const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' })
          if (accounts.length > 0) {
            setConnectedAccount(accounts[0])
            await fetchEthBalance(accounts[0])
          }
        } catch (err) {
          console.error('Error checking MetaMask connection:', err)
        }
      }
    }
    
    checkConnection()
  }, [])

  function arrayBufferToBase64(buffer: ArrayBuffer) {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    const chunkSize = 0x8000
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunkSize)))
    }
    return typeof window !== 'undefined' ? window.btoa(binary) : Buffer.from(binary, 'binary').toString('base64')
  }

  async function handleVerify() {
    if (!file) {
      setStatus('Please select a PDF document first.')
      return
    }
    setLoading(true)
    setStatus('Uploading and scanning...')
    try {
      const arrayBuffer = await file.arrayBuffer()
      const b64 = arrayBufferToBase64(arrayBuffer)
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, content: b64 }),
      })
      
      // Check if response is JSON
      const contentType = res.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text()
        console.error('Non-JSON response:', text)
        setStatus('Server returned invalid response format')
        return
      }
      
      const data = await res.json()
      console.log('verify response', data)
      if (res.ok && data.ok) {
        setStatus(data.message || 'Verified successfully')
        if (data.nft) {
          setTokens((t) => [data.nft, ...t])
        } else if (data.token) {
          setTokens((t) => [{ id: data.token, coordinates: data.coordinates ?? null, sourceFile: file.name }, ...t])
        }
      } else {
        setStatus(data?.message || 'Verification failed')
      }
    } catch (err) {
      console.error(err)
      setStatus('Network or server error')
    } finally {
      setLoading(false)
    }
  }

  async function fetchEthBalance(account: string) {
    try {
      setIsLoadingBalance(true)
      const balance = await (window as any).ethereum.request({
        method: 'eth_getBalance',
        params: [account, 'latest']
      })
      // Convert from wei to ETH (1 ETH = 10^18 wei)
      const balanceInEth = (parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4)
      setEthBalance(balanceInEth)
    } catch (err) {
      console.error('Error fetching balance:', err)
      setEthBalance('0')
    } finally {
      setIsLoadingBalance(false)
    }
  }

  async function connectMetaMask() {
    try {
      if (typeof window === 'undefined' || !(window as any).ethereum) {
        setStatus('MetaMask not detected in this browser.')
        return
      }
      const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' })
      if (Array.isArray(accounts) && accounts[0]) {
        setConnectedAccount(accounts[0])
        setStatus(`Connected: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`)
        // Fetch the balance for the connected account
        await fetchEthBalance(accounts[0])
      } else {
        setStatus('No account returned from MetaMask.')
      }
    } catch (err) {
      console.error('MetaMask connect error', err)
      setStatus('MetaMask connection failed.')
    }
  }

  function pushToPortfolio(tokenObj: any) {
    try {
      const tokenId = tokenObj.id ?? tokenObj.token
      
      // Create a land property from the token data
      const landProperty = {
        id: tokenId,
        title: `Land ${tokenId.slice(-4)}`, // Use last 4 characters for display
        description: `Verified land document with coordinates: ${Array.isArray(tokenObj.coordinates) ? tokenObj.coordinates.map((c: any) => `${c.lat}, ${c.lon}`).join(' · ') : 'N/A'}`,
        price: '0', // Free acquisition through verification
        area: '1.0 acres', // Default area
        location: 'Verified Location',
        seller: 'System',
        sellerName: 'DhartiLink Verification',
        purchaseDate: new Date().toISOString().split('T')[0],
        sourceFile: tokenObj.sourceFile,
        coordinates: tokenObj.coordinates
      }
      
      // Add to purchased lands
      addPurchasedLand(landProperty)
      
      // Show success message
      setStatus(`Token ${tokenId} added to portfolio successfully!`)
      
    } catch (e) {
      console.error('Error adding to portfolio:', e)
      setStatus('Error adding token to portfolio')
    }
  }

  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    padding: 40,
    background: 'linear-gradient(180deg, #000000 0%, #06060a 100%)',
    color: '#e6eef8',
    fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto",
    display: 'flex',
    alignItems: 'stretch',
    justifyContent: 'center',
  }

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1.25fr 1fr',
    gap: 28,
    width: '100%',
    maxWidth: 1280,
    alignItems: 'start',
  }

  const card: React.CSSProperties = {
    background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',
    border: '1px solid rgba(255,255,255,0.03)',
    borderRadius: 14,
    padding: 28, // increased
    boxShadow: '0 10px 40px rgba(2,6,23,0.7)',
    color: '#DCEEFF',
    minHeight: 260, // larger boxes
  }

  const largeCard: React.CSSProperties = {
    ...card,
    minHeight: 520, // larger center card
    padding: 32,
  }

  const titleStyle: React.CSSProperties = {
    margin: 0,
    marginBottom: 14,
    fontSize: 22, // slightly larger
    color: '#F7FAFF',
    fontWeight: 700,
  }

  const smallText: React.CSSProperties = {
    color: '#9FB9E6',
    fontSize: 14, // slightly larger
  }

  const labelStyle: React.CSSProperties = {
    color: '#A9C6FF',
    fontSize: 14,
    marginBottom: 8,
    display: 'block',
  }

  const btnPrimary: React.CSSProperties = {
    background: 'linear-gradient(90deg,#111827,#1f2937)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.06)',
    padding: '12px 16px', // larger button
    borderRadius: 12,
    cursor: 'pointer',
    fontWeight: 800,
    fontSize: 15,
  }

  const inputStyle: React.CSSProperties = {
    background: 'transparent',
    color: '#D9EEFF',
    border: '1px dashed rgba(255,255,255,0.04)',
    padding: 14, // larger input area
    borderRadius: 12,
    width: '100%',
    fontSize: 15,
  }

  const tokenItemStyle: React.CSSProperties = {
    padding: 16, // larger token item
    borderRadius: 12,
    background: 'rgba(255,255,255,0.01)',
    border: '1px solid rgba(255,255,255,0.02)',
  }

  const tokenIdStyle: React.CSSProperties = {
    fontWeight: 800,
    color: '#EAF2FF',
    fontSize: 16,
  }

  return (
    <WalletProvider>
      <div style={pageStyle}>
        {/* Navigation Header */}
        <div style={{ 
          position: 'absolute', 
          top: 20, 
          left: 20, 
          zIndex: 10 
        }}>
          <button
            onClick={() => router.push('/#wallet')}
            style={{
              background: 'linear-gradient(90deg,#7c3aed,#5b21b6)',
              color: '#fff',
              border: 'none',
              padding: '12px 20px',
              borderRadius: 12,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(124, 58, 237, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.3)'
            }}
          >
            ← Back to Main Wallet
          </button>
        </div>

        <div style={gridStyle}>
          {/* Left column */}
          <div style={card}>
            <h2 style={titleStyle}>Balance</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 8 }}>
              {connectedAccount ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div>
                      <div style={{ color: '#A9C6FF', fontSize: 14 }}>Owner ID</div>
                      <div style={{ fontSize: 16, fontWeight: 800, wordBreak: 'break-all' }}>
                        {connectedAccount.slice(0, 6)}...{connectedAccount.slice(-4)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#A9C6FF', fontSize: 14 }}>Status</div>
                      <div style={{ fontSize: 15, color: '#4ade80' }}>Connected</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ color: '#A9C6FF', fontSize: 14 }}>ETH Balance</div>
                      <div style={{ fontSize: 20, fontWeight: 800 }}>
                        {isLoadingBalance ? 'Loading...' : `${ethBalance} ETH`}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: '#A9C6FF', fontSize: 14 }}>Network</div>
                      <div style={{ fontSize: 16, fontWeight: 800 }}>Ethereum</div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div>
                      <div style={{ color: '#A9C6FF', fontSize: 14 }}>USD</div>
                      <div style={{ fontSize: 20, fontWeight: 800 }}>$0.00</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#A9C6FF', fontSize: 14 }}>Status</div>
                      <div style={{ fontSize: 15, color: '#9ca3af' }}>Not Connected</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ color: '#A9C6FF', fontSize: 14 }}>ETH</div>
                      <div style={{ fontSize: 20, fontWeight: 800 }}>0.0000</div>
                    </div>
                    <div>
                      <div style={{ color: '#A9C6FF', fontSize: 14 }}>MATIC</div>
                      <div style={{ fontSize: 20, fontWeight: 800 }}>0.00</div>
                    </div>
                  </div>
                </>
              )}

              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <button style={btnPrimary} onClick={connectMetaMask}>
                  {connectedAccount ? 'Refresh Balance' : 'Connect MetaMask'}
                </button>

                {connectedAccount && (
                  <button 
                    style={{
                      background: 'transparent',
                      color: '#CFE0FF',
                      border: '1px solid rgba(255,255,255,0.04)',
                      padding: '10px 14px',
                      borderRadius: 10,
                      cursor: 'pointer',
                      fontSize: 14,
                    }}
                    onClick={() => fetchEthBalance(connectedAccount)}
                    disabled={isLoadingBalance}
                  >
                    {isLoadingBalance ? 'Loading...' : 'Refresh'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Center column */}
          <div style={largeCard}>
            <h2 style={titleStyle}>Verify Land</h2>
            <p style={smallText}>Upload a land document (PDF). OCR will extract coordinates and convert to an NFT on success.</p>

            <div style={{ display: 'flex', gap: 20, marginTop: 22, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 360px' }}>
                <label style={labelStyle}>Document</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  style={inputStyle}
                />
                <div style={{ marginTop: 12, color: '#9FB9E6', fontSize: 14 }}>
                  {file ? file.name : 'No file selected'}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
                <button
                  style={{ ...btnPrimary, minWidth: 180 }}
                  onClick={handleVerify}
                  disabled={loading || !file}
                >
                  {loading ? 'Scanning...' : 'Verify Land'}
                </button>

                <button
                  style={{
                    background: 'transparent',
                    color: '#CFE0FF',
                    border: '1px solid rgba(255,255,255,0.04)',
                    padding: '10px 14px',
                    borderRadius: 10,
                    cursor: 'pointer',
                    fontSize: 14,
                  }}
                  onClick={() => {
                    setFile(null)
                    setStatus(null)
                  }}
                >
                  Reset
                </button>
              </div>
            </div>

            <div style={{ marginTop: 24 }}>
              {status && (
                <div
                  style={{
                    padding: 14,
                    borderRadius: 12,
                    background: status.toLowerCase().includes('success') ? 'linear-gradient(90deg,#052e12,#07371a)' : 'linear-gradient(90deg,#3b0b0b,#4a0d0d)',
                    color: '#E8FFF0',
                    border: '1px solid rgba(255,255,255,0.03)',
                    maxWidth: 720,
                    fontSize: 15,
                  }}
                >
                  {status}
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div style={card}>
            <h2 style={titleStyle}>Recent Tokens</h2>
            <div style={{ marginTop: 10, color: '#9FB9E6', fontSize: 14 }}>
              Tokens created from verified documents appear here.
            </div>

            <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {tokens.length === 0 && (
                <div style={tokenItemStyle}>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>No tokens yet</div>
                </div>
              )}

              {tokens.map((t) => (
                <div key={t.id || t.token} style={tokenItemStyle}>
                  <div style={tokenIdStyle}>{t.id ?? t.token}</div>
                  <div style={{ fontSize: 14, color: '#9FB9E6' }}>File: {t.sourceFile ?? '-'}</div>
                  <div style={{ fontSize: 14, color: '#9FB9E6', marginTop: 6 }}>
                    Coordinates: {Array.isArray(t.coordinates) ? t.coordinates.map((c: any) => `${c.lat}, ${c.lon}`).join(' · ') : (t.coordinates ? JSON.stringify(t.coordinates) : '-')}
                  </div>

                  <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
                    <button
                      onClick={() => pushToPortfolio(t)}
                      style={{
                        background: 'linear-gradient(90deg,#7c3aed,#5b21b6)',
                        color: '#fff',
                        border: 'none',
                        padding: '10px 14px',
                        borderRadius: 10,
                        cursor: 'pointer',
                        fontWeight: 800,
                        fontSize: 14,
                      }}
                    >
                      Send to Portfolio
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </WalletProvider>
  )
}