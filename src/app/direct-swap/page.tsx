'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import WalletContextProvider from '../../components/WalletContextProvider'

// Dynamically import the direct swap interface to avoid SSR issues
const DirectSwapInterface = dynamic(
  () => import('../../components/DirectSwapInterface'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#22d3ee', marginBottom: '0.5rem' }}>
            Direct Jupiter
          </h1>
          <p style={{ color: '#e5e7eb', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Direct Jupiter API Integration
          </p>
          <div className="text-center text-white">Loading...</div>
        </div>
      </div>
    )
  }
)

export default function DirectSwapPage() {
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
            Direct Jupiter
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
            SOL to USDC Swaps
          </h2>
          <p style={{ 
            color: '#9ca3af', 
            fontSize: '0.875rem', 
            maxWidth: '24rem',
            margin: '0 auto 1.5rem',
            textAlign: 'center',
            width: '100%'
          }}>
            Direct Jupiter API integration with your code pattern
          </p>
        </div>

        {/* Direct Swap Interface */}
        <DirectSwapInterface />

        {/* Footer Info */}
        <div className="text-center mt-8" style={{ paddingTop: '2rem' }}>
          <p style={{ 
            color: '#6b7280', 
            fontSize: '0.75rem',
            marginBottom: '0.5rem'
          }}>
            Powered by{' '}
            <a 
              href="https://station.jup.ag/api-v6" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#22d3ee', textDecoration: 'none' }}
            >
              Jupiter API v6
            </a>
          </p>
          <p style={{ 
            color: '#6b7280', 
            fontSize: '0.75rem'
          }}>
            <a 
              href="/" 
              style={{ color: '#9ca3af', textDecoration: 'none' }}
            >
              ← Back to Jupiter Plugin
            </a>
          </p>
        </div>
      </div>
    </WalletContextProvider>
  )
}
