import { Token, QuoteResponse } from '../types'

// Simple Jupiter service that uses direct API calls with proper error handling
export class JupiterSimpleService {
  private tokens: Token[] = []

  constructor() {
    console.log('🚀 Initializing Jupiter Simple Service')
  }

  // Load tokens from multiple sources
  async loadTokens(): Promise<Token[]> {
    try {
      console.log('🔄 Loading tokens from multiple sources...')
      
      // Try multiple token list sources
      const tokenSources = [
        'https://token.jup.ag/strict',
        'https://token.jup.ag/all',
        'https://raw.githubusercontent.com/solana-labs/token-list/main/src/tokens/solana.tokenlist.json'
      ]
      
      for (const source of tokenSources) {
        try {
          console.log(`🌐 Trying token source: ${source}`)
          const response = await fetch(source, {
            signal: AbortSignal.timeout(5000) // 5 second timeout
          })
          
          if (!response.ok) {
            console.warn(`⚠️ Source ${source} failed with status: ${response.status}`)
            continue
          }
          
          const tokenData = await response.json()
          let tokens: any[] = []
          
          // Handle different response formats
          if (Array.isArray(tokenData)) {
            tokens = tokenData
          } else if (tokenData.tokens) {
            tokens = tokenData.tokens
          } else if (tokenData.data) {
            tokens = tokenData.data
          }
          
          if (tokens.length > 0) {
            this.tokens = tokens.map((token: any) => ({
              address: token.address || token.mint,
              symbol: token.symbol,
              name: token.name,
              decimals: token.decimals,
              logoURI: token.logoURI || token.image
            }))
            
            console.log('✅ Loaded tokens from', source, ':', this.tokens.length)
            return this.tokens
          }
        } catch (sourceError) {
          console.warn(`⚠️ Source ${source} failed:`, sourceError)
          continue
        }
      }
      
      // If all sources fail, use a basic token list
      console.log('⚠️ All token sources failed, using basic token list')
      this.tokens = [
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
        {
          address: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
          symbol: 'RAY',
          name: 'Raydium',
          decimals: 6,
        },
        {
          address: 'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt',
          symbol: 'SRM',
          name: 'Serum',
          decimals: 6,
        },
        {
          address: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE',
          symbol: 'ORCA',
          name: 'Orca',
          decimals: 6,
        }
      ]
      
      console.log('✅ Using basic token list:', this.tokens.length)
      return this.tokens
      
    } catch (error) {
      console.error('❌ Error loading tokens:', error)
      throw error
    }
  }

  // Get quote from Jupiter API
  async getQuote(
    inputMint: string,
    outputMint: string,
    amount: string,
    slippageBps: number = 50
  ): Promise<QuoteResponse> {
    try {
      console.log('🔍 Getting quote from Jupiter API...')
      console.log('📊 Quote params:', { inputMint, outputMint, amount, slippageBps })
      
      // Validate inputs
      if (!inputMint || !outputMint || !amount) {
        throw new Error('Missing required parameters: inputMint, outputMint, amount')
      }
      
      if (parseInt(amount) <= 0) {
        throw new Error('Amount must be greater than 0')
      }
      
      // Create URL with proper parameters
      const params = new URLSearchParams({
        inputMint,
        outputMint,
        amount,
        slippageBps: slippageBps.toString(),
        swapMode: 'ExactIn'
      })
      
      const url = `https://lite-api.jup.ag/swap/v1/quote?${params}`
      console.log('🌐 Requesting quote from:', url)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'JupAgg/1.0.0'
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      })
      
      console.log('📡 Response status:', response.status, response.statusText)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ API Error:', response.status, errorText)
        
        if (response.status === 401) {
          console.error('❌ 401 Unauthorized - Jupiter API requires authentication')
          console.error('   - The Jupiter API now requires an API key')
          console.error('   - Please check Jupiter API documentation for authentication requirements')
        } else if (response.status === 422) {
          console.error('❌ 422 Error - Invalid parameters:')
          console.error('   - inputMint:', inputMint)
          console.error('   - outputMint:', outputMint)
          console.error('   - amount:', amount)
          console.error('   - slippageBps:', slippageBps)
          console.error('   - Error response:', errorText)
        }
        
        throw new Error(`Jupiter API error: ${response.status} ${response.statusText} - ${errorText}`)
      }
      
      const quoteData = await response.json()
      console.log('✅ Quote received:', quoteData)
      return quoteData
      
    } catch (error: any) {
      console.error('❌ Quote error:', error)
      throw new Error(`Failed to get quote: ${error.message}`)
    }
  }

  // Get swap transaction from Jupiter API
  async getSwapTransaction(quoteResponse: QuoteResponse, userPublicKey: string) {
    try {
      console.log('🔧 Building swap transaction...')
      console.log('📊 Swap params:', { userPublicKey })
      
      const swapRequest = {
        quoteResponse,
        userPublicKey,
        wrapAndUnwrapSol: true,
        prioritizationFeeLamports: 1000000
      }
      
      const response = await fetch('https://lite-api.jup.ag/swap/v1/swap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'JupAgg/1.0.0'
        },
        body: JSON.stringify(swapRequest),
        signal: AbortSignal.timeout(15000) // 15 second timeout
      })
      
      console.log('📡 Swap response status:', response.status, response.statusText)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Swap API Error:', response.status, errorText)
        
        if (response.status === 401) {
          console.error('❌ 401 Unauthorized - Jupiter API requires authentication')
          console.error('   - The Jupiter API now requires an API key')
          console.error('   - Please check Jupiter API documentation for authentication requirements')
        } else if (response.status === 422) {
          console.error('❌ 422 Swap Error - Invalid parameters:')
          console.error('   - userPublicKey:', userPublicKey)
          console.error('   - quoteResponse keys:', Object.keys(quoteResponse))
          console.error('   - Error response:', errorText)
        }
        
        throw new Error(`Jupiter swap API error: ${response.status} ${response.statusText} - ${errorText}`)
      }
      
      const swapData = await response.json()
      console.log('✅ Swap transaction built:', swapData)
      return swapData
      
    } catch (error: any) {
      console.error('❌ Swap transaction error:', error)
      throw new Error(`Failed to build swap transaction: ${error.message}`)
    }
  }

  // Execute swap using the built transaction
  async executeSwap(
    quoteResponse: QuoteResponse,
    userPublicKey: string,
    signTransaction: (transaction: any) => Promise<any>
  ): Promise<string> {
    try {
      console.log('🚀 Starting swap execution...')
      
      // Get fresh quote
      console.log('🔄 Getting fresh quote...')
      const freshQuote = await this.getQuote(
        quoteResponse.inputMint,
        quoteResponse.outputMint,
        quoteResponse.inAmount,
        50 // 0.5% slippage
      )
      console.log('✅ Fresh quote obtained')
      
      // Get swap transaction
      console.log('🔧 Building swap transaction...')
      const swapResponse = await this.getSwapTransaction(freshQuote, userPublicKey)
      
      // Deserialize the transaction
      console.log('📦 Deserializing transaction...')
      const { VersionedTransaction } = await import('@solana/web3.js')
      const transactionBuffer = Buffer.from(swapResponse.swapTransaction, 'base64')
      const transaction = VersionedTransaction.deserialize(transactionBuffer)
      
      // Sign the transaction
      console.log('✍️ Signing transaction...')
      const signedTransaction = await signTransaction(transaction)
      
      // Send the transaction using a simple connection
      console.log('📤 Sending transaction...')
      const { Connection } = await import('@solana/web3.js')
      const connection = new Connection(
        process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com', 
        'confirmed'
      )
      
      const signature = await connection.sendTransaction(signedTransaction, {
        skipPreflight: false,
        maxRetries: 3
      })
      
      console.log('✅ Swap executed successfully!')
      console.log('📝 Transaction signature:', signature)
      console.log('🔗 View on Solscan:', `https://solscan.io/tx/${signature}`)
      
      return signature
      
    } catch (error: any) {
      console.error('💥 Swap execution failed:', error)
      
      let errorMessage = 'Swap execution failed'
      if (error?.message?.includes('insufficient')) {
        errorMessage = 'Insufficient balance for this swap'
      } else if (error?.message?.includes('slippage')) {
        errorMessage = 'Slippage tolerance exceeded. Try increasing slippage'
      } else if (error?.message?.includes('timeout')) {
        errorMessage = 'Transaction timed out. Please try again'
      } else if (error?.message?.includes('403')) {
        errorMessage = 'RPC access denied. Please try a different RPC endpoint'
      } else if (error?.message?.includes('429')) {
        errorMessage = 'Rate limited. Please wait a moment and try again'
      } else if (error?.message?.includes('Network')) {
        errorMessage = 'Network error. Please check your connection'
      }
      
      throw new Error(`${errorMessage}: ${error?.message || 'Unknown error'}`)
    }
  }
}

// Export singleton instance
export const jupiterSimpleService = new JupiterSimpleService()
