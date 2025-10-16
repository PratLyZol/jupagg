'use client'

import React, { useEffect, useRef } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'

const JupiterPlugin: React.FC = () => {
  const wallet = useWallet()
  const containerRef = useRef<HTMLDivElement>(null)
  const initializationAttempted = useRef(false)
  const [isInitialized, setIsInitialized] = React.useState(false)

  // Load configuration from environment variables
  const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'
  const referralAccount = process.env.NEXT_PUBLIC_JUP_REFERRAL_ACCOUNT
  const referralBps = parseInt(process.env.NEXT_PUBLIC_JUP_REFERRAL_BPS || '0')
  const defaultInputMint = process.env.NEXT_PUBLIC_DEFAULT_INPUT_MINT || 'So11111111111111111111111111111111111111112'
  const defaultOutputMint = process.env.NEXT_PUBLIC_DEFAULT_OUTPUT_MINT || 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
  // Use strict token list as fallback when token.jup.ag is unreachable
  const strictTokenList = true // Set to true to use verified tokens only

  useEffect(() => {
    // Check if already loaded (from previous mount)
    if ((window as any).__jupiterTerminalLoaded && window.Jupiter) {
      console.log('✅ Jupiter Terminal already loaded')
      setIsInitialized(true)
      return
    }

    // Prevent duplicate initialization attempts
    if (initializationAttempted.current || typeof window === 'undefined') {
      return
    }

    // Global flag to prevent multiple instances
    if ((window as any).__jupiterTerminalLoading) {
      console.log('⏳ Jupiter Terminal already loading...')
      return
    }

    initializationAttempted.current = true
    ;(window as any).__jupiterTerminalLoading = true

    console.log('📍 Starting Jupiter Terminal integration...')

    // Load Jupiter script
    const loadJupiterScript = () => {
      return new Promise<void>((resolve, reject) => {
        // Check if script already exists
        const existingScript = document.querySelector('script[src="https://terminal.jup.ag/main-v2.js"]')
        
        if (existingScript) {
          console.log('♻️ Jupiter script already in DOM')
          if (window.Jupiter) {
            resolve()
          } else {
            existingScript.addEventListener('load', () => resolve())
          }
          return
        }

        // Create and load script
        const script = document.createElement('script')
        script.src = 'https://terminal.jup.ag/main-v2.js'
        script.async = true
        script.onload = () => {
          console.log('📦 Jupiter script loaded')
          resolve()
        }
        script.onerror = () => {
          console.error('❌ Failed to load Jupiter script')
          ;(window as any).__jupiterTerminalLoading = false
          reject(new Error('Failed to load Jupiter script'))
        }
        document.head.appendChild(script)
      })
    }

    // Initialize Jupiter Terminal
    const initializeTerminal = async () => {
      try {
        // Wait for script to load
        await loadJupiterScript()

        // Wait for Jupiter to be available
        let jupiterCheckAttempts = 0
        while (!window.Jupiter && jupiterCheckAttempts < 50) {
          await new Promise(resolve => setTimeout(resolve, 100))
          jupiterCheckAttempts++
        }

        if (!window.Jupiter) {
          throw new Error('Jupiter not available after script load')
        }

        console.log('✅ Jupiter API available, preparing initialization...')
        
        // Small delay to ensure everything is ready
        await new Promise(resolve => setTimeout(resolve, 100))

        // Use widget mode - creates a floating button that Jupiter manages
        const displayMode = 'widget' as 'integrated' | 'modal' | 'widget'
        
        // Build configuration
        const config: any = {
          displayMode,
          endpoint: rpcUrl,
          strictTokenList,
          defaultExplorer: 'Solscan',
          formProps: {
            initialInputMint: defaultInputMint,
            initialOutputMint: defaultOutputMint,
          },
          // Don't use passThroughWallet - let Jupiter handle wallet connection
          onSuccess: (txid: string) => {
            console.log('✅ Swap successful!', txid)
            console.log(`🔗 View on Solscan: https://solscan.io/tx/${txid}`)
          },
          onFormUpdate: (form: any) => {
            console.log('📊 Form updated:', form)
          },
        }
        
        console.log('📋 Using display mode:', displayMode)

        // Add referral configuration if provided
        if (referralAccount && referralBps > 0) {
          config.referral = {
            account: referralAccount,
            feeBps: referralBps,
          }
          console.log('💰 Referral enabled:', config.referral)
        }

        console.log('🚀 Initializing Jupiter Terminal...', config)

        // Initialize Jupiter Terminal
        await window.Jupiter.init(config)
        
        console.log('✅ Jupiter Terminal initialized successfully!')
        ;(window as any).__jupiterTerminalLoaded = true
        ;(window as any).__jupiterTerminalLoading = false
        setIsInitialized(true)

      } catch (error) {
        console.error('❌ Failed to initialize Jupiter Terminal:', error)
        ;(window as any).__jupiterTerminalLoading = false
        initializationAttempted.current = false
      }
    }

    // Start initialization
    initializeTerminal()

    // Cleanup function
    return () => {
      // Note: We intentionally don't cleanup to avoid issues with React Strict Mode
      // The global flags prevent duplicate initialization
    }
  }, []) // Empty dependency array - only run once

  // Update wallet when it changes
  useEffect(() => {
    if ((window as any).__jupiterTerminalLoaded && window.Jupiter) {
      console.log('💼 Wallet changed, Jupiter will use new wallet automatically')
    }
  }, [wallet])

  const openJupiterModal = () => {
    console.log('🔍 Attempting to open Jupiter modal...')
    console.log('Jupiter object:', window.Jupiter)
    
    if (window.Jupiter) {
      // Try different methods that might be available
      if (typeof (window.Jupiter as any).open === 'function') {
        console.log('✓ Using Jupiter.open()')
        ;(window.Jupiter as any).open()
      } else if (typeof (window.Jupiter as any).show === 'function') {
        console.log('✓ Using Jupiter.show()')
        ;(window.Jupiter as any).show()
      } else if (typeof (window.Jupiter as any).resume === 'function') {
        console.log('✓ Using Jupiter.resume()')
        ;(window.Jupiter as any).resume()
      } else {
        console.error('❌ Jupiter object exists but no open/show/resume method found')
        console.log('Available methods:', Object.keys(window.Jupiter))
      }
    } else {
      console.error('❌ Jupiter Terminal not initialized yet')
    }
  }

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        maxWidth: '400px',
        margin: '0 auto',
        textAlign: 'center',
        minHeight: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Hidden element for integrated mode (if we switch back) */}
      <div id="jupiter-terminal" style={{ display: 'none' }} />
      
      {/* Status message */}
      {!isInitialized ? (
        <div style={{ 
          color: '#9ca3af', 
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            border: '2px solid #9ca3af',
            borderTopColor: '#00D4FF',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
          Loading Jupiter Terminal...
        </div>
      ) : (
        <div style={{ 
          color: '#22d3ee', 
          fontSize: '0.875rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: '#22d3ee' }}>
            <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Jupiter Terminal Ready
          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
            Look for the floating Jupiter button on your screen
          </div>
        </div>
      )}
    </div>
  )
}

export default JupiterPlugin  