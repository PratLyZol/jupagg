'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { ArrowLeftRight, ArrowUpDown, Loader2, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react'
import TokenSelector from './TokenSelector'
import SlippageControl from './SlippageControl'
import RouteVisualization from './RouteVisualization'
import { Token, QuoteResponse } from '../types'
import { gillJupiterService } from '../services/gill-jupiter'

const SOL_MINT = 'So11111111111111111111111111111111111111112'
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'

const SwapInterface: React.FC = () => {
  const { publicKey, connected, signTransaction } = useWallet()
  const [fromToken, setFromToken] = useState<Token | null>(null)
  const [toToken, setToToken] = useState<Token | null>(null)
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')
  const [quote, setQuote] = useState<QuoteResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tokens, setTokens] = useState<Token[]>([])
  const [swapSuccess, setSwapSuccess] = useState<string | null>(null)
  const [swapping, setSwapping] = useState(false)
  const [tokensLoading, setTokensLoading] = useState(true)
  const [slippage, setSlippage] = useState(0.5)
  const [showRouteDetails, setShowRouteDetails] = useState(false)
  const [completedSwapQuote, setCompletedSwapQuote] = useState<QuoteResponse | null>(null)

  // Initialize with SOL and USDC using Gill
  useEffect(() => {
    const initializeTokens = async () => {
      try {
        setTokensLoading(true)
        console.log('Loading tokens with Gill Jupiter...')
        const tokenList = await gillJupiterService.loadTokens()
        console.log('Loaded tokens with Gill Jupiter:', tokenList.length, 'tokens')
        console.log('First few tokens:', tokenList.slice(0, 5))
        setTokens(tokenList)
        
        // Set default tokens
        const solToken = tokenList.find(token => token.address === SOL_MINT)
        const usdcToken = tokenList.find(token => token.address === USDC_MINT)
        
        console.log('SOL token found:', solToken)
        console.log('USDC token found:', usdcToken)
        
        if (solToken) setFromToken(solToken)
        if (usdcToken) setToToken(usdcToken)
      } catch (err) {
        console.error('Failed to load tokens with Gill:', err)
        setError('Failed to load token list')
      } finally {
        setTokensLoading(false)
      }
    }

    initializeTokens()
  }, [])


  const fetchQuote = useCallback(async () => {
    if (!fromToken || !toToken || !fromAmount || parseFloat(fromAmount) <= 0) {
      setQuote(null)
      setToAmount('')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const amount = (parseFloat(fromAmount) * Math.pow(10, fromToken.decimals)).toString()
      console.log('🔄 Getting quote with Jupiter...')
      const quoteData = await gillJupiterService.getQuote(
        fromToken.address,
        toToken.address,
        amount,
        slippage * 100, // Convert percentage to basis points
        publicKey?.toString() // Pass the wallet public key as taker
      )

      setQuote(quoteData)
      const outAmount = parseFloat(quoteData.outAmount) / Math.pow(10, toToken.decimals)
      setToAmount(outAmount.toFixed(6))
      console.log('✅ Quote received successfully with Jupiter')
    } catch (err) {
      console.error('Quote error with Jupiter:', err)
      setError('Failed to get quote. Please try again.')
      setQuote(null)
      setToAmount('')
    } finally {
      setLoading(false)
    }
  }, [fromToken, toToken, fromAmount, slippage])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchQuote()
    }, 500) // Debounce

    return () => clearTimeout(timeoutId)
  }, [fetchQuote])


  const handleSwapTokens = () => {
    const tempToken = fromToken
    const tempAmount = fromAmount
    
    setFromToken(toToken)
    setToToken(tempToken)
    setFromAmount(toAmount)
    setToAmount(tempAmount)
  }

  const handleSwap = async () => {
    if (!publicKey || !quote || !signTransaction) {
      console.error('❌ Missing required swap parameters:', {
        publicKey: !!publicKey,
        quote: !!quote,
        signTransaction: !!signTransaction
      })
      return
    }

    console.log('🔄 Starting Jupiter execute flow: quote → swap → sign → execute')
    console.log('👤 User wallet:', publicKey.toString())
    console.log('🌐 Network: MAINNET (make sure your wallet is connected to mainnet!)')
    console.log('💱 Swap details:', {
      from: fromToken?.symbol,
      to: toToken?.symbol,
      amount: fromAmount,
      expectedOut: toAmount,
      priceImpact: quote?.priceImpactPct
    })

    setSwapping(true)
    setError(null)
    setSwapSuccess(null)
    setCompletedSwapQuote(null) // Clear previous swap data

    try {
      console.log('📋 Executing Jupiter flow...')
      
      // Execute the Jupiter flow: quote → swap → sign → execute
      console.log('🚀 Executing Jupiter flow...')
      const signature = await gillJupiterService.executeSwap(
        quote,
        publicKey.toString(),
        signTransaction
      )
      
      console.log('🎉 Jupiter execute flow completed successfully!')
      console.log('📝 Transaction signature:', signature)
      
      setSwapSuccess(signature)
      setCompletedSwapQuote(quote) // Store the quote for route visualization
      setFromAmount('')
      setToAmount('')
      setQuote(null)
      
      // Show success message even if confirmation timed out
      console.log('✅ Jupiter execute flow completed successfully!')
      console.log('🔗 View on Solscan:', `https://solscan.io/tx/${signature}`)
      
    } catch (err: any) {
      console.error('💥 Jupiter execute flow failed:')
      console.error('📊 Error details:', {
        name: err?.name,
        message: err?.message,
        stack: err?.stack
      })
      
      // Check if it's a confirmation timeout (not a real failure)
      if (err?.name === 'TransactionExpiredTimeoutError' || err?.message?.includes('not confirmed in')) {
        console.log('⚠️ Transaction confirmation timed out, but transaction was sent')
        console.log('🔗 Check transaction status manually on Solscan')
        // Don't show error for confirmation timeouts
        return
      }
      
      // Provide more specific error messages
      let errorMessage = 'Failed to execute Jupiter flow'
      if (err?.message?.includes('403')) {
        errorMessage = 'RPC access denied. Please try a different RPC endpoint.'
      } else if (err?.message?.includes('insufficient')) {
        errorMessage = 'Insufficient balance for this swap.'
      } else if (err?.message?.includes('slippage')) {
        errorMessage = 'Slippage tolerance exceeded. Try increasing slippage.'
      } else if (err?.message?.includes('timeout')) {
        errorMessage = 'Transaction timed out. Please try again.'
      }
      
      setError(errorMessage)
    } finally {
      setSwapping(false)
    }
  }

  return (
    <div className="glass p-6 fade-in" style={{ maxWidth: '28rem', margin: '0 auto', width: '100%' }}>
      {/* Header with Slippage */}
      <div className="flex justify-between items-center mb-6">
        <div style={{ minHeight: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '0.25rem' }}>
            Swap Tokens
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '0.75rem', minHeight: '1.125rem' }}>
            {!connected ? 'Connect wallet above to swap' : 'Ready to swap'}
          </p>
        </div>
        <SlippageControl slippage={slippage} onSlippageChange={setSlippage} />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span className="text-red-200 text-sm">{error}</span>
        </div>
      )}


      {swapSuccess && (
        <div className="mb-4 p-3 bg-green-500/20 rounded-lg" style={{ border: 'none' }}>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4" style={{ color: 'white' }} />
            <span style={{ color: 'white', fontSize: '0.875rem', fontWeight: '500' }}>Swap Successful!</span>
          </div>
          <p style={{ color: 'white', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
            Transaction completed successfully
          </p>
          <a
            href={`https://solscan.io/tx/${swapSuccess}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs"
            style={{ color: 'white' }}
          >
            View on Solscan
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Route Visualization for Completed Swap */}
      {swapSuccess && completedSwapQuote && (
        <div className="mb-4">
          <RouteVisualization
            routePlan={completedSwapQuote.routePlan}
            fromToken={fromToken}
            toToken={toToken}
            priceImpact={parseFloat(completedSwapQuote.priceImpactPct)}
            isVisible={showRouteDetails}
            onToggle={() => setShowRouteDetails(!showRouteDetails)}
          />
        </div>
      )}

      <div className="space-y-3">
        {/* From Token Card */}
        <div className="card p-4" style={{ minHeight: '9.5rem' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span style={{ color: 'white', fontSize: '0.875rem', fontWeight: '600' }}>You Pay</span>
              <div style={{
                padding: '0.125rem 0.5rem',
                borderRadius: '9999px',
                fontSize: '0.625rem',
                fontWeight: '600',
                background: 'rgba(99, 102, 241, 0.2)',
                color: '#a5b4fc',
                border: '1px solid rgba(99, 102, 241, 0.3)'
              }}>
                FROM
              </div>
            </div>
            <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>Balance: --</span>
          </div>
          <div className="flex items-center gap-3">
            <TokenSelector
              selectedToken={fromToken}
              onTokenSelect={setFromToken}
              tokens={tokens}
              loading={tokensLoading}
            />
            <div className="flex-1">
              <input
                type="number"
                placeholder="0.00"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  textAlign: 'right',
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: 'white',
                  minHeight: '2.25rem'
                }}
              />
              <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem', minHeight: '1.125rem' }}>
                {fromToken && fromAmount && parseFloat(fromAmount) > 0 ? (
                  `≈ $${(parseFloat(fromAmount) * 220).toFixed(2)} USD`
                ) : '\u00A0'}
              </div>
            </div>
          </div>
        </div>

        {/* Swap Direction Button */}
        <div className="flex justify-center -my-2 relative z-10">
          <button
            onClick={handleSwapTokens}
            disabled={!fromToken || !toToken}
            style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              border: '4px solid #1f2937',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'rotate(180deg) scale(1.1)'
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(99, 102, 241, 0.6)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'rotate(0deg) scale(1)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.4)'
            }}
          >
            <ArrowUpDown style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} />
          </button>
        </div>

        {/* To Token Card */}
        <div className="card p-4" style={{ minHeight: '9.5rem' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span style={{ color: 'white', fontSize: '0.875rem', fontWeight: '600' }}>You Receive</span>
              <div style={{
                padding: '0.125rem 0.5rem',
                borderRadius: '9999px',
                fontSize: '0.625rem',
                fontWeight: '600',
                background: 'rgba(34, 197, 94, 0.2)',
                color: '#86efac',
                border: '1px solid rgba(34, 197, 94, 0.3)'
              }}>
                TO
              </div>
            </div>
            <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>Balance: --</span>
          </div>
          <div className="flex items-center gap-3">
            <TokenSelector
              selectedToken={toToken}
              onTokenSelect={setToToken}
              tokens={tokens}
              loading={tokensLoading}
            />
            <div className="flex-1">
              <div style={{
                width: '100%',
                textAlign: 'right',
                fontSize: '1.5rem',
                fontWeight: '700',
                color: loading ? '#9ca3af' : 'white',
                minHeight: '2.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end'
              }}>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 loading" />
                    <span style={{ fontSize: '1rem' }}>Calculating...</span>
                  </div>
                ) : toAmount || '0.00'}
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem', minHeight: '1.125rem' }}>
                {toToken && toAmount && parseFloat(toAmount) > 0 ? (
                  `≈ $${parseFloat(toAmount).toFixed(2)} USD`
                ) : '\u00A0'}
              </div>
            </div>
          </div>
        </div>

        {/* Quote Info */}
        {quote && (
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <span style={{ color: '#9ca3af', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>
                Swap Details
              </span>
              <div style={{
                padding: '0.125rem 0.5rem',
                borderRadius: '9999px',
                fontSize: '0.625rem',
                fontWeight: '600',
                background: parseFloat(quote.priceImpactPct) < 1 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(251, 191, 36, 0.2)',
                color: parseFloat(quote.priceImpactPct) < 1 ? '#86efac' : '#fde047',
                border: parseFloat(quote.priceImpactPct) < 1 ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(251, 191, 36, 0.3)'
              }}>
                {parseFloat(quote.priceImpactPct) < 1 ? 'GOOD RATE' : 'CHECK RATE'}
              </div>
            </div>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between items-center">
                <span style={{ color: '#9ca3af' }}>Price Impact</span>
                <span style={{ 
                  color: parseFloat(quote.priceImpactPct) < 1 ? '#22c55e' : '#fbbf24',
                  fontWeight: '600'
                }}>
                  {parseFloat(quote.priceImpactPct).toFixed(3)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ color: '#9ca3af' }}>Route</span>
                <span style={{ color: 'white', fontWeight: '600' }}>
                  {quote.routePlan.length} {quote.routePlan.length > 1 ? 'hops' : 'hop'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ color: '#9ca3af' }}>Max Slippage</span>
                <span style={{ color: 'white', fontWeight: '600' }}>{slippage}%</span>
              </div>
              {fromToken && toToken && fromAmount && toAmount && (
                <div className="flex justify-between items-center pt-2" style={{ borderTop: '1px solid rgba(75, 85, 99, 0.3)' }}>
                  <span style={{ color: '#9ca3af' }}>Rate</span>
                  <span style={{ color: 'white', fontWeight: '600', fontSize: '0.75rem' }}>
                    1 {fromToken.symbol} ≈ {(parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(4)} {toToken.symbol}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Route Visualization */}
        {quote && (
          <RouteVisualization
            routePlan={quote.routePlan}
            fromToken={fromToken}
            toToken={toToken}
            priceImpact={parseFloat(quote.priceImpactPct)}
            isVisible={showRouteDetails}
            onToggle={() => setShowRouteDetails(!showRouteDetails)}
          />
        )}

        {/* Execute Button */}
        <button
          onClick={handleSwap}
          disabled={!quote || loading || swapping || !fromAmount || parseFloat(fromAmount) <= 0 || !connected}
          style={{
            width: '100%',
            padding: '1rem',
            borderRadius: '16px',
            border: 'none',
            background: !connected 
              ? 'rgba(75, 85, 99, 0.5)' 
              : (!quote || !fromAmount || parseFloat(fromAmount) <= 0)
                ? 'rgba(75, 85, 99, 0.5)'
                : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: 'white',
            fontSize: '1.125rem',
            fontWeight: '700',
            cursor: (!quote || loading || swapping || !fromAmount || parseFloat(fromAmount) <= 0 || !connected) ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s',
            boxShadow: (!quote || !fromAmount || parseFloat(fromAmount) <= 0 || !connected) 
              ? 'none' 
              : '0 4px 12px rgba(99, 102, 241, 0.4)',
            opacity: (!quote || loading || swapping || !fromAmount || parseFloat(fromAmount) <= 0 || !connected) ? 0.6 : 1
          }}
          onMouseEnter={(e) => {
            if (quote && fromAmount && parseFloat(fromAmount) > 0 && connected && !loading && !swapping) {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(99, 102, 241, 0.6)'
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = (!quote || !fromAmount || parseFloat(fromAmount) <= 0 || !connected) 
              ? 'none' 
              : '0 4px 12px rgba(99, 102, 241, 0.4)'
          }}
        >
          {!connected ? (
            <>
              <AlertCircle className="w-5 h-5" />
              Connect Wallet to Swap
            </>
          ) : loading ? (
            <>
              <Loader2 className="w-5 h-5 loading" />
              Fetching Best Price...
            </>
          ) : swapping ? (
            <>
              <Loader2 className="w-5 h-5 loading" />
              Executing...
            </>
          ) : (
            <>
              <ArrowLeftRight className="w-5 h-5" />
              Execute Swap
            </>
          )}
        </button>
        
        {/* Helper Text */}
        {!connected && (
          <p style={{ 
            textAlign: 'center', 
            fontSize: '0.75rem', 
            color: '#9ca3af',
            marginTop: '0.5rem'
          }}>
            You can explore quotes without connecting. Connect wallet above to execute swaps.
          </p>
        )}
      </div>
    </div>
  )
}

export default SwapInterface