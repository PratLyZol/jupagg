import React, { useState, useEffect, useCallback } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { ArrowLeftRight, ArrowUpDown, Loader2, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react'
import TokenSelector from './TokenSelector'
import { Token, QuoteResponse } from '../types'
import { jupiterService, JupiterSDK } from '../services/jupiter'

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

  // Initialize Jupiter SDK
  const [jupiterSDK, setJupiterSDK] = useState<JupiterSDK | null>(null)
  
  useEffect(() => {
    if (connection) {
      setJupiterSDK(new JupiterSDK(connection))
    }
  }, [connection])

  // Initialize with SOL and USDC
  useEffect(() => {
    const initializeTokens = async () => {
      if (!jupiterSDK) return
      
      try {
        setTokensLoading(true)
        console.log('Loading tokens from Jupiter SDK...')
        const tokenList = await jupiterSDK.loadTokens()
        console.log('Loaded tokens:', tokenList.length, 'tokens')
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
        console.error('Failed to load tokens:', err)
        setError('Failed to load token list')
      } finally {
        setTokensLoading(false)
      }
    }

    initializeTokens()
  }, [jupiterSDK])


  const fetchQuote = useCallback(async () => {
    if (!fromToken || !toToken || !fromAmount || parseFloat(fromAmount) <= 0 || !jupiterSDK) {
      setQuote(null)
      setToAmount('')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const amount = (parseFloat(fromAmount) * Math.pow(10, fromToken.decimals)).toString()
      const quoteData = await jupiterSDK.quote(
        fromToken.address,
        toToken.address,
        amount,
        50 // 0.5% slippage
      )

      setQuote(quoteData)
      const outAmount = parseFloat(quoteData.outAmount) / Math.pow(10, toToken.decimals)
      setToAmount(outAmount.toFixed(6))
    } catch (err) {
      console.error('Quote error:', err)
      setError('Failed to get quote. Please try again.')
      setQuote(null)
      setToAmount('')
    } finally {
      setLoading(false)
    }
  }, [fromToken, toToken, fromAmount, jupiterSDK])

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
    if (!publicKey || !quote || !signTransaction || !jupiterSDK) {
      console.error('❌ Missing required swap parameters:', {
        publicKey: !!publicKey,
        quote: !!quote,
        signTransaction: !!signTransaction,
        jupiterSDK: !!jupiterSDK
      })
      return
    }

    console.log('🔄 Starting swap process with Jupiter SDK...')
    console.log('👤 User wallet:', publicKey.toString())
    console.log('💱 Swap quote:', {
      from: fromToken?.symbol,
      to: toToken?.symbol,
      amount: fromAmount,
      expectedOut: toAmount,
      priceImpact: quote?.priceImpactPct
    })

    setSwapping(true)
    setError(null)
    setSwapSuccess(null)

    try {
      console.log('📋 Building swap transaction with Jupiter SDK...')
      const swapRequest = {
        quoteResponse: quote,
        userPublicKey: publicKey.toString(),
        wrapAndUnwrapSol: true,
        // Remove all advanced parameters to use the most basic swap request
        // This should avoid address lookup tables entirely
      }

      const swapResponse = await jupiterSDK.getSwapTransaction(swapRequest)
      console.log('✅ Swap transaction built successfully')
      
      // Execute the actual swap using Jupiter SDK
      console.log('🚀 Executing swap transaction with Jupiter SDK...')
      const signature = await jupiterSDK.executeSwap(
        swapResponse,
        signTransaction
      )
      
      console.log('🎉 Swap completed successfully!')
      console.log('📝 Transaction signature:', signature)
      
      setSwapSuccess(signature)
      setFromAmount('')
      setToAmount('')
      setQuote(null)
      
    } catch (err: any) {
      console.error('💥 Swap process failed:')
      console.error('📊 Error details:', {
        name: err?.name,
        message: err?.message,
        stack: err?.stack
      })
      
      // Provide more specific error messages
      let errorMessage = 'Failed to execute swap transaction'
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
    <div className="mb-4 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <AlertCircle className="w-4 h-4 text-yellow-400" />
        <span className="text-yellow-100 text-sm font-medium">Wallet Not Connected</span>
      </div>
      <p className="text-yellow-100 text-xs mb-3">
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
        <div style={{ fontSize: '0.875rem', color: 'white', backgroundColor: '#374151', padding: '0.25rem 0.75rem', borderRadius: '9999px' }}>
          Slippage: Auto
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span className="text-red-200 text-sm">{error}</span>
        </div>
      )}


      {swapSuccess && (
        <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-green-200 text-sm font-medium">Swap Successful!</span>
          </div>
          <p className="text-green-200/80 text-xs mb-2">
            Transaction completed successfully
          </p>
          <a
            href={`https://solscan.io/tx/${swapSuccess}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-green-300 hover:text-green-200 text-xs"
          >
            View on Solscan
            <ExternalLink className="w-3 h-3" />
          </a>
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
                <span className="text-white/80">Price Impact</span>
                <span className="text-white">
                  {parseFloat(quote.priceImpactPct).toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/80">Route</span>
                <span className="text-white">
                  {quote.routePlan.length} hop{quote.routePlan.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/80">Slippage</span>
                <span className="text-white">0.5%</span>
              </div>
            </div>
          </div>
        )}

        {/* Swap Button */}
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
              Swapping...
            </>
          ) : (
            <>
              <ArrowLeftRight className="w-5 h-5" />
              Swap
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default SwapInterface
