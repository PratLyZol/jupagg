'use client'

import React, { useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { Token } from '../types'

export interface TokenSelectorProps {
  selectedToken: Token | null
  onTokenSelect: (token: Token) => void
  tokens: Token[]
  loading?: boolean
}

const TokenSelector: React.FC<TokenSelectorProps> = ({
  selectedToken,
  onTokenSelect,
  tokens,
  loading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  console.log('TokenSelector received tokens:', tokens.length)

  const filteredTokens = tokens.filter(token =>
    token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.address.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    // Prioritize popular tokens
    const popularTokens = ['SOL', 'USDC', 'USDT', 'RAY', 'SRM', 'ORCA', 'MNGO', 'BONK', 'WIF', 'POPCAT', 'JUP', 'mSOL', 'Ether', 'WETH', 'WBTC', 'BOME', 'PYTH', 'HBB']
    const aPopular = popularTokens.includes(a.symbol)
    const bPopular = popularTokens.includes(b.symbol)
    
    if (aPopular && !bPopular) return -1
    if (!aPopular && bPopular) return 1
    return a.symbol.localeCompare(b.symbol)
  })

  const handleTokenSelect = (token: Token) => {
    onTokenSelect(token)
    setIsOpen(false)
    setSearchTerm('')
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-secondary flex items-center gap-3 min-w-[180px] h-14 px-4"
      >
        {loading ? (
          <span className="text-sm text-white-300">Loading...</span>
        ) : selectedToken ? (
          <>
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white text-base font-bold">
              {selectedToken.symbol.charAt(0)}
            </div>
            <span className="font-medium text-white">{selectedToken.symbol}</span>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white text-lg">
              +
            </div>
            <span className="text-white">Select asset</span>
          </>
        )}
        <ChevronDown className="w-4 h-4 ml-auto text-white-300" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-100 mt-2 glass p-6 z-10 max-h-[500px] overflow-hidden min-w-[400px] w-full">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white-300" />
            <input
              type="text"
              placeholder="Search tokens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 text-base h-12"
            />
          </div>
          
          <div className="max-h-[400px] overflow-y-auto space-y-2">
            {filteredTokens.slice(0, 30).map((token) => (
              <button
                key={token.address}
                onClick={() => handleTokenSelect(token)}
                style={{
                  width: '100%',
                  padding: '1.25rem',
                  textAlign: 'left',
                  backgroundColor: 'rgba(31, 41, 55, 0.4)',
                  border: '1px solid rgba(75, 85, 99, 0.3)',
                  borderRadius: '16px',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  cursor: 'pointer',
                  marginBottom: '0.75rem',
                  minHeight: '4rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(55, 65, 81, 0.7)'
                  e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(31, 41, 55, 0.4)'
                  e.currentTarget.style.borderColor = 'rgba(75, 85, 99, 0.3)'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div style={{
                  width: '3.5rem',
                  height: '3.5rem',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.8), rgba(139, 92, 246, 0.8))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.125rem',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)'
                }}>
                  {token.symbol.charAt(0)}
                </div>
                <div className="flex-1 text-left">
                  <div style={{ color: 'white', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
                    {token.symbol}
                    {['SOL', 'USDC', 'USDT', 'RAY', 'SRM', 'ORCA', 'MNGO', 'BONK', 'WIF', 'POPCAT', 'JUP', 'mSOL', 'Ether', 'WETH', 'WBTC', 'BOME', 'PYTH', 'HBB'].includes(token.symbol) && (
                      <span style={{ fontSize: '0.75rem', backgroundColor: 'rgba(34, 197, 94, 0.2)', color: '#86efac', padding: '0.125rem 0.5rem', borderRadius: '9999px', border: '1px solid rgba(34, 197, 94, 0.3)' }}>Popular</span>
                    )}
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{token.name}</div>
                </div>
              </button>
            ))}
            {filteredTokens.length === 0 && (
              <div className="text-center text-white-300 text-sm py-4">
                No tokens found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default TokenSelector
export { TokenSelector }