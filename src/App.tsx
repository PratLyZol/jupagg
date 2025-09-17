import React from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Connection } from '@solana/web3.js'
import SwapInterface from './components/SwapInterface'

// Use a proxied RPC endpoint to avoid CORS issues
const endpoint = 'http://localhost:5173/api/solana'
const wallets = [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter(),
]

function App() {
  // Test RPC connection on app start
  React.useEffect(() => {
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
          <div className="w-full max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#22d3ee', marginBottom: '0.5rem' }}>
                Jup<span style={{ color: '#fb923c' }}>Agg</span>
              </h1>
              <p style={{ color: '#e5e7eb', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                Solana Swap Aggregator powered by Jupiter
              </p>
              <div className="flex justify-center">
                <WalletMultiButton />
              </div>
            </div>
            <SwapInterface />
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export default App
