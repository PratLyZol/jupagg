'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
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
  const { connection } = useConnection()
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

  // Show wallet connection prompt at the top if not connected
  const walletPrompt = !connected && (
    <div className="wallet-prompt mb-4 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <AlertCircle className="w-4 h-4 text-white" />
        <span className="text-white text-sm font-medium">Wallet Not Connected</span>
      </div>
      <p className="text-white text-xs mb-3">
        Connect your wallet to execute swaps. You can still explore quotes below.
      </p>
      <div className="flex justify-center">
        <WalletMultiButton className="!bg-transparent !border !border-white/20 !text-white hover:!bg-white/10 !rounded-lg !text-xs !py-2 !px-3" />
      </div>
    </div>
  )

  return (
    <div className="glass p-6 fade-in max-w-md mx-auto">
      {walletPrompt}
      
      <div className="flex justify-between items-center mb-6">
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>Swap</h2>
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

      <div className="space-y-4">
        {/* From Token */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span style={{ color: 'white', fontSize: '0.875rem', fontWeight: '500', textTransform: 'uppercase' }}>From</span>
            <span style={{ color: '#d1d5db', fontSize: '0.75rem' }}>Balance: --</span>
          </div>
          <div className="flex items-center gap-3">
            <TokenSelector
              selectedToken={fromToken}
              onTokenSelect={setFromToken}
              tokens={tokens}
              loading={tokensLoading}
            />
            <input
              type="number"
              placeholder="0.0"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              className="input flex-1 text-right text-lg font-medium"
            />
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSwapTokens}
            className="btn btn-secondary w-10 h-10 rounded-full flex items-center justify-center"
            disabled={!fromToken || !toToken}
          >
            <ArrowUpDown className="w-5 h-5" />
          </button>
        </div>

        {/* To Token */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span style={{ color: 'white', fontSize: '0.875rem', fontWeight: '500', textTransform: 'uppercase' }}>To</span>
            <span style={{ color: '#d1d5db', fontSize: '0.75rem' }}>Balance: --</span>
          </div>
          <div className="flex items-center gap-3">
            <TokenSelector
              selectedToken={toToken}
              onTokenSelect={setToToken}
              tokens={tokens}
              loading={tokensLoading}
            />
            <input
              type="number"
              placeholder="0.0"
              value={toAmount}
              readOnly
              className="input flex-1 text-right text-lg font-medium bg-gray-800"
            />
          </div>
        </div>

        {/* Quote Info */}
        {quote && (
          <div className="card">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span style={{ color: 'white' }}>Price Impact</span>
                <span style={{ color: 'white' }}>
                  {parseFloat(quote.priceImpactPct).toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'white' }}>Route</span>
                <span style={{ color: 'white' }}>
                  {quote.routePlan.length} hop{quote.routePlan.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'white' }}>Slippage</span>
                <span style={{ color: 'white' }}>{slippage}%</span>
              </div>
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
          className="btn btn-primary w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 loading" />
              Getting Quote...
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
      </div>
    </div>
  )
}

export default SwapInterface