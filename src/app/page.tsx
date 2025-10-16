'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import WalletContextProvider from '../components/WalletContextProvider'
import SwapInterface from '../components/SwapInterface'

// Dynamically import the swap interface to avoid SSR issues
const SwapInterfaceDynamic = dynamic(
  () => import('../components/SwapInterface'),
  { 
    ssr: false,
    loading: () => (
      <div className="glass p-6 fade-in max-w-md mx-auto">
        <div className="text-center">
          <div className="loading mb-4" style={{ width: '40px', height: '40px', margin: '0 auto' }} />
          <p className="text-white">Loading swap interface...</p>
        </div>
      </div>
    )
  }
)

export default function Home() {
  return (
    <WalletContextProvider>
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2" style={{ 
              background: 'linear-gradient(135deg, #22d3ee, #fb923c)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              JupAgg
            </h1>
            <p className="text-gray-400 text-sm">
              Solana Swap Aggregator powered by Jupiter
            </p>
          </div>

          {/* Swap Interface */}
          <SwapInterfaceDynamic />

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-gray-500 text-xs">
              Powered by{' '}
              <a 
                href="https://jup.ag" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300"
              >
                Jupiter
              </a>
              {' + '}
              <a 
                href="https://github.com/solana-developers/solana-rpc-get-started" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-orange-400 hover:text-orange-300"
              >
                Gill
              </a>
            </p>
          </div>
        </div>
      </div>
    </WalletContextProvider>
  )
}
