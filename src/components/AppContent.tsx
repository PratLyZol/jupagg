'use client'

import React from 'react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import SwapInterface from './SwapInterface'
import WalletContextProvider from './WalletContextProvider'

export default function AppContent() {
  return (
    <WalletContextProvider>
      <div className="w-full max-w-md mx-auto px-4">
        {/* Hero Section */}
        <div className="mb-8 fade-in" style={{ textAlign: 'center', width: '100%' }}>
          {/* Logo */}
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: 'bold', 
            background: 'linear-gradient(135deg, #22d3ee, #fb923c)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '0.75rem',
            textAlign: 'center',
            width: '100%'
          }}>
            JupAgg
          </h1>
          
          {/* Tagline */}
          <h2 style={{ 
            color: 'white', 
            fontSize: '1.25rem', 
            fontWeight: '600',
            marginBottom: '0.5rem',
            letterSpacing: '-0.025em',
            textAlign: 'center',
            width: '100%'
          }}>
            Swap Solana Tokens Instantly
          </h2>
          <p style={{ 
            color: '#9ca3af', 
            fontSize: '0.875rem', 
            maxWidth: '24rem',
            margin: '0 auto 1.5rem',
            textAlign: 'center',
            width: '100%'
          }}>
            Best prices across all Solana DEXs with Jupiter aggregation
          </p>

          {/* Wallet Button */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
            <WalletMultiButton style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              border: 'none',
              borderRadius: '12px',
              fontSize: '0.875rem',
              fontWeight: '600',
              padding: '0.875rem 1.5rem',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
              transition: 'all 0.2s'
            }} />
          </div>
        </div>

        {/* Swap Interface */}
        <SwapInterface />

        {/* Footer Info */}
        <div className="text-center mt-6 mb-8" style={{ paddingBottom: '2rem' }}>
          <p style={{ 
            color: '#6b7280', 
            fontSize: '0.75rem'
          }}>
            Powered by{' '}
            <a 
              href="https://jup.ag" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#22d3ee', textDecoration: 'none' }}
            >
              Jupiter
            </a>
            {' & '}
            <a 
              href="https://solana.com" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#fb923c', textDecoration: 'none' }}
            >
              Solana
            </a>
          </p>
        </div>
      </div>
    </WalletContextProvider>
  )
}
