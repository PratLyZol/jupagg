'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import the entire wallet-enabled app to avoid SSR issues
const AppContent = dynamic(
  () => import('../components/AppContent'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#22d3ee', marginBottom: '0.5rem' }}>
            Jup<span style={{ color: '#fb923c' }}>Agg</span>
          </h1>
          <p style={{ color: '#e5e7eb', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Solana Swap Aggregator powered by Jupiter
          </p>
          <div className="text-center text-white">Loading...</div>
        </div>
      </div>
    )
  }
)

export default function Home() {
  return <AppContent />
}
