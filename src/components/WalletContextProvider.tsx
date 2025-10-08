'use client'

import React, { FC, ReactNode, useMemo, useEffect } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { Connection } from '@solana/web3.js'

// Use a public RPC endpoint that supports WebSockets
const endpoint = 'https://api.mainnet.solana.com'

const WalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  )

  // Test RPC connection on app start
  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('🧪 Testing RPC connection on app start...')
        const connection = new Connection(endpoint, 'confirmed')
        const version = await connection.getVersion()
        console.log('✅ RPC connection test successful:', version)
      } catch (error) {
        console.error('❌ RPC connection test error:', error)
      }
    }
    
    testConnection()
  }, [])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export default WalletContextProvider
