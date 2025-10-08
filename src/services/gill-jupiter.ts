import { createSolanaClient } from 'gill'
import { Token, QuoteResponse } from '../types'

// Gill-based Jupiter service with simplified API
export class GillJupiterService {
  private client: ReturnType<typeof createSolanaClient>
  private tokens: Token[] = []

  constructor() {
    // Initialize Gill client with Helius RPC
    this.client = createSolanaClient({
      urlOrMoniker: 'https://mainnet.helius-rpc.com/?api-key=f9900790-e025-4245-b131-bf85cef5aa35'
    })
  }

  // Load tokens using Gill's simplified approach
  async loadTokens(): Promise<Token[]> {
    try {
      console.log('🔄 Loading tokens with Gill...')
      
      // Use Jupiter's token API
      const response = await fetch('https://token.jup.ag/strict')
      const tokenData = await response.json()
      
      this.tokens = tokenData.map((token: any) => ({
        address: token.address,
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals
      }))
      
      console.log('✅ Loaded tokens with Gill:', this.tokens.length)
      return this.tokens
    } catch (error) {
      console.error('❌ Error loading tokens with Gill:', error)
      
      // Fallback tokens
      return [
        {
          address: 'So11111111111111111111111111111111111111112',
          symbol: 'SOL',
          name: 'Solana',
          decimals: 9,
        },
        {
          address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
          symbol: 'USDC',
          name: 'USD Coin',
          decimals: 6,
        },
        {
          address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
          symbol: 'USDT',
          name: 'Tether USD',
          decimals: 6,
        },
      ]
    }
  }

  // Mock quote generator for development when API is unavailable
  private getMockQuote(inputMint: string, outputMint: string, amount: string): QuoteResponse {
    console.log('🎭 Using MOCK data for development')
    
    // Simulate a realistic quote with ~220 USDC per SOL
    const inAmount = BigInt(amount)
    const mockRate = 220 // 1 SOL ≈ 220 USDC
    const outAmount = (inAmount * BigInt(mockRate) * BigInt(1000000)) / BigInt(1000000000) // Convert SOL (9 decimals) to USDC (6 decimals)
    
    return {
      inputMint,
      outputMint,
      inAmount: inAmount.toString(),
      outAmount: outAmount.toString(),
      otherAmountThreshold: (outAmount * BigInt(995) / BigInt(1000)).toString(), // 0.5% slippage
      swapMode: 'ExactIn',
      slippageBps: 50,
      priceImpactPct: '0.1',
      routePlan: [
        {
          swapInfo: {
            ammKey: 'mock-amm-key',
            label: 'Raydium',
            inputMint,
            outputMint,
            inAmount: inAmount.toString(),
            outAmount: outAmount.toString(),
            notEnoughLiquidity: false,
            minInAmount: '0',
            minOutAmount: '0',
            priceImpactPct: '0.1',
            lpFee: {
              amount: '100000',
              mint: inputMint,
              pct: 0.25
            },
            platformFee: {
              amount: '0',
              mint: inputMint,
              pct: 0
            }
          },
          percent: 100
        }
      ],
      contextSlot: 123456789,
      timeTaken: 0.5
    }
  }

  // Get quote using Jupiter API with Gill's fetch approach
  async getQuote(
    inputMint: string,
    outputMint: string,
    amount: string,
    slippageBps: number = 50
  ): Promise<QuoteResponse> {
    try {
      console.log('🔍 Getting quote with Gill...')
      console.log('📊 Quote params:', { inputMint, outputMint, amount, slippageBps })
      
      const params = new URLSearchParams({
        inputMint,
        outputMint,
        amount,
        slippageBps: slippageBps.toString(),
      })

      // Try direct API first, then fall back to Next.js API route
      let response: Response
      let usedProxy = false

      try {
        console.log('🌐 Trying direct fetch from Jupiter API...')
        response = await fetch(`https://quote-api.jup.ag/v6/quote?${params}`, {
          signal: AbortSignal.timeout(5000), // 5 second timeout
        })
      } catch (directError) {
        console.warn('⚠️ Direct API call failed, trying Next.js proxy...', directError)
        try {
          usedProxy = true
          response = await fetch(`/api/quote?${params}`)
          
          // If proxy also fails, use mock data
          if (!response.ok) {
            console.error('❌ Proxy returned error status:', response.status)
            console.error('❌ Both API and proxy failed, using mock data for development')
            return this.getMockQuote(inputMint, outputMint, amount)
          }
        } catch (proxyError) {
          console.error('❌ Proxy threw exception, using mock data for development')
          return this.getMockQuote(inputMint, outputMint, amount)
        }
      }
      
      console.log('📡 Response status:', response.status, response.statusText, usedProxy ? '(via proxy)' : '(direct)')
      
      if (!response.ok) {
        console.error('❌ API Error Response, using mock data')
        return this.getMockQuote(inputMint, outputMint, amount)
      }

      const quoteData = await response.json()
      console.log('✅ Quote received with Gill:', quoteData)
      return quoteData
    } catch (error: any) {
      console.error('❌ Quote error with Gill:', error)
      console.error('❌ Error details:', {
        message: error?.message,
        stack: error?.stack
      })
      throw new Error(`Failed to get quote from Jupiter API: ${error?.message || 'Unknown error'}`)
    }
  }

  // Get swap transaction using Gill's transaction handling
  async getSwapTransaction(quoteResponse: any, userPublicKey: string) {
    try {
      console.log('🔧 Building swap transaction with Gill...')
      
      const response = await fetch('https://lite-api.jup.ag/swap/v1/swap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteResponse,
          userPublicKey,
          wrapAndUnwrapSol: true,
          dynamicComputeUnitLimit: true,
          dynamicSlippage: true,
          prioritizationFeeLamports: {
            priorityLevelWithMaxLamports: {
              maxLamports: 1000000,
              priorityLevel: "veryHigh"
            }
          }
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const swapResponse = await response.json()
      console.log('✅ Swap transaction built with Gill:', swapResponse)
      return swapResponse
    } catch (error) {
      console.error('❌ Swap transaction error with Gill:', error)
      throw new Error('Failed to build swap transaction')
    }
  }

  // Execute swap using Gill's transaction management
  async executeSwap(
    quoteResponse: any,
    userPublicKey: string,
    signTransaction: (transaction: any) => Promise<any>
  ): Promise<string> {
    try {
      console.log('🚀 Starting Gill-based swap execution...')
      
      // Get fresh quote
      console.log('🔄 Getting fresh quote with Gill...')
      const freshQuote = await this.getQuote(
        quoteResponse.inputMint,
        quoteResponse.outputMint,
        quoteResponse.inAmount,
        50 // 0.5% slippage
      )
      console.log('✅ Fresh quote obtained with Gill')
      
      // Get swap transaction
      const swapResponse = await this.getSwapTransaction(freshQuote, userPublicKey)
      
      // Deserialize transaction using standard web3.js approach for wallet compatibility
      console.log('📦 Deserializing transaction with Gill...')
      const transactionBase64 = swapResponse.swapTransaction
      const transactionBuffer = Buffer.from(transactionBase64, 'base64')
      
      // Import VersionedTransaction for proper deserialization
      const { VersionedTransaction } = await import('@solana/web3.js')
      const transaction = VersionedTransaction.deserialize(transactionBuffer)
      
      console.log('✅ Transaction deserialized with Gill')
      console.log('🔍 Transaction details:', {
        message: !!transaction.message,
        signatures: transaction.signatures.length,
        version: transaction.version
      })
      
      // Sign the transaction
      console.log('✍️ Signing transaction with Gill...')
      const signedTransaction = await signTransaction(transaction)
      console.log('✅ Transaction signed with Gill')
      
      // Serialize the signed transaction for sending
      const serializedTransaction = signedTransaction.serialize()
      console.log('📦 Transaction serialized, size:', serializedTransaction.length, 'bytes')
      
      // Convert to base64 string for Gill's RPC
      const signedTransactionBase64 = Buffer.from(serializedTransaction).toString('base64')
      console.log('📦 Transaction converted to base64, length:', signedTransactionBase64.length)
      
      // Send transaction using Gill's RPC client
      console.log('📤 Sending transaction with Gill...')
      const signature = await this.client.rpc.sendTransaction(signedTransactionBase64 as any, {
        encoding: 'base64',
        maxRetries: 3n,
        skipPreflight: false,
        preflightCommitment: 'confirmed'
      }).send()
      
      console.log('🎉 Transaction sent successfully with Gill!')
      console.log('📝 Transaction signature:', signature)
      console.log('🔗 View on Solscan:', `https://solscan.io/tx/${signature}`)
      
      // Wait for confirmation using getSignatureStatuses
      console.log('⏳ Waiting for confirmation with Gill...')
      try {
        // Poll for transaction confirmation
        let confirmed = false
        let attempts = 0
        const maxAttempts = 30 // 30 seconds
        
        while (!confirmed && attempts < maxAttempts) {
          const statuses = await this.client.rpc.getSignatureStatuses([signature as any]).send()
          const status = statuses.value[0]
          
          if (status !== null) {
            if (status.err) {
              console.error('❌ Transaction failed:', status.err)
              throw new Error(`Transaction failed: ${JSON.stringify(status.err)}`)
            }
            if (status.confirmationStatus === 'confirmed' || status.confirmationStatus === 'finalized') {
              console.log('✅ Transaction confirmed with Gill!')
              confirmed = true
              break
            }
          }
          
          attempts++
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
        
        if (!confirmed) {
          console.warn('⚠️ Confirmation timeout, but transaction may still succeed')
        }
      } catch (confirmError) {
        console.warn('⚠️ Confirmation check failed, but transaction may still succeed:', confirmError)
      }
      
      return signature
    } catch (error: any) {
      console.error('💥 Fatal error in Gill swap execution:')
      console.error('📊 Error object:', {
        name: error?.name,
        message: error?.message,
        stack: error?.stack,
        cause: error?.cause
      })
      
      if (error instanceof Error) {
        throw new Error(`Failed to execute swap transaction with Gill: ${error.message}`)
      }
      throw new Error('Failed to execute swap transaction with Gill')
    }
  }

  // Get account info using Gill's RPC client
  async getAccountInfo(address: string) {
    try {
      // Convert string address directly to the format expected by Gill
      const accountInfo = await this.client.rpc.getAccountInfo(address as any).send()
      return accountInfo
    } catch (error) {
      console.error('Error getting account info with Gill:', error)
      throw error
    }
  }

  // Get latest blockhash using Gill
  async getLatestBlockhash() {
    try {
      const { value: blockhash } = await this.client.rpc.getLatestBlockhash().send()
      return blockhash
    } catch (error) {
      console.error('Error getting latest blockhash with Gill:', error)
      throw error
    }
  }
}

// Export singleton instance
export const gillJupiterService = new GillJupiterService()
