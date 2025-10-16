'use client'

import React from 'react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import JupiterPlugin from './JupiterPlugin'
import WalletContextProvider from './WalletContextProvider'

export default function AppContent() {
  return (
    <WalletContextProvider>
      <div className="w-full max-w-md mx-auto px-4" style={{ minHeight: '100vh', paddingTop: '2rem', paddingBottom: '2rem' }}>
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
            Gill + Jupiter
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
            Swap Solana Tokens
          </h2>
          <p style={{ 
            color: '#9ca3af', 
            fontSize: '0.875rem', 
            maxWidth: '24rem',
            margin: '0 auto 1.5rem',
            textAlign: 'center',
            width: '100%'
          }}>
            Powered by Jupiter Plugin with Gill wallet integration
          </p>

          {/* Wallet Button */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', marginBottom: '2rem' }}>
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

        {/* Jupiter Plugin Integration */}
        <JupiterPlugin />

        {/* Footer Info */}
        <div className="text-center mt-8" style={{ paddingTop: '2rem' }}>
          <p style={{ 
            color: '#6b7280', 
            fontSize: '0.75rem',
            marginBottom: '0.5rem'
          }}>
            Powered by{' '}
            <a 
              href="https://station.jup.ag/docs/apis/swap-api" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#22d3ee', textDecoration: 'none' }}
            >
              Jupiter Plugin
            </a>
            {' + '}
            <a 
              href="https://github.com/solana-developers/solana-rpc-get-started" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#fb923c', textDecoration: 'none' }}
            >
              Gill
            </a>
          </p>
          <p style={{ 
            color: '#6b7280', 
            fontSize: '0.75rem'
          }}>
            <a 
              href="https://github.com/solana-foundation/templates" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#9ca3af', textDecoration: 'none' }}
            >
              View Template Source
            </a>
          </p>
        </div>
      </div>
    </WalletContextProvider>
  )
}
