import { createSolanaClient } from 'gill'
import { PublicKey, Connection } from '@solana/web3.js'
import { Token, QuoteResponse } from '../types'

// Gill-based Jupiter service with simplified API
export class GillJupiterService {
  private client: ReturnType<typeof createSolanaClient>
  private connection: Connection
  private tokens: Token[] = []

  constructor() {
    // Initialize Gill client with environment RPC URL
    this.client = createSolanaClient({
      urlOrMoniker: process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'
    })
    
    // Initialize connection for transaction sending
    this.connection = new Connection(
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
      'confirmed'
    )
  }

  // Load tokens using Gill's approach with working endpoints
  async loadTokens(): Promise<Token[]> {
    try {
      console.log('🔄 Loading tokens with Gill...')
      
      // Try multiple token sources
      const tokenSources = [
        'https://raw.githubusercontent.com/solana-labs/token-list/main/src/tokens/solana.tokenlist.json',
        'https://token.jup.ag/strict',
        'https://token.jup.ag/all'
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
            
            console.log('✅ Loaded tokens with Gill from', source, ':', this.tokens.length)
            return this.tokens
          }
        } catch (sourceError) {
          console.warn(`⚠️ Source ${source} failed:`, sourceError)
          continue
        }
      }
      
      // If all sources fail, use expanded basic token list
      console.log('⚠️ All token sources failed, using expanded basic token list')
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
        },
        {
          address: 'MangoCzJ36AjZyKwVj3VnYU4geOnfmLTkgxY3tuonJ4',
          symbol: 'MNGO',
          name: 'Mango',
          decimals: 6,
        },
        {
          address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
          symbol: 'BONK',
          name: 'Bonk',
          decimals: 5,
        },
        {
          address: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
          symbol: 'WIF',
          name: 'dogwifhat',
          decimals: 6,
        },
        {
          address: '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr',
          symbol: 'POPCAT',
          name: 'Popcat',
          decimals: 9,
        },
        {
          address: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
          symbol: 'JUP',
          name: 'Jupiter',
          decimals: 6,
        },
        {
          address: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
          symbol: 'mSOL',
          name: 'Marinade Staked SOL',
          decimals: 9,
        },
        {
          address: '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs',
          symbol: 'Ether',
          name: 'Ether (Wormhole)',
          decimals: 8,
        },
        {
          address: 'A9mUU4qviSctJVPJdBJWkb28deg915LYJKrzQ19ji3FM',
          symbol: 'USDCet',
          name: 'USD Coin (Wormhole)',
          decimals: 6,
        },
        {
          address: 'Dn4noZ5jgGfkwnzcQfZkbeNzw9r6ZkFSnCUgCE6PacGo',
          symbol: 'USDTet',
          name: 'Tether USD (Wormhole)',
          decimals: 6,
        },
        {
          address: '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs',
          symbol: 'WETH',
          name: 'Wrapped Ether (Wormhole)',
          decimals: 8,
        },
        {
          address: 'A94X7f6yPArgcSEbFJzqK4exwJhztK4nKvJf3jR6Vet',
          symbol: 'WBTC',
          name: 'Wrapped Bitcoin (Wormhole)',
          decimals: 8,
        },
        {
          address: '5oVNBeEEQvYi1cX3ir8Dx5n1P7pdxydbGF2X4TxVusJm',
          symbol: 'BOME',
          name: 'BOOK OF MEME',
          decimals: 6,
        },
        {
          address: 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3',
          symbol: 'PYTH',
          name: 'Pyth Network',
          decimals: 6,
        },
        {
          address: 'HBB111SCpV91WwQKnQHwpTwCyh1ueA3bFuc8z2S1k4e2',
          symbol: 'HBB',
          name: 'Hubble Protocol Token',
          decimals: 6,
        }
      ]
      
      console.log('✅ Using basic token list with Gill:', this.tokens.length)
      return this.tokens
      
    } catch (error) {
      console.error('❌ Error loading tokens with Gill:', error)
      throw error
    }
  }


  // Get quote using Jupiter API via proxy
  async getQuote(
    inputMint: string,
    outputMint: string,
    amount: string,
    slippageBps: number = 50,
    taker?: string
  ): Promise<any> {
    try {
      console.log('🔍 Getting quote using Jupiter API via proxy...')
      console.log('📊 Quote params:', { inputMint, outputMint, amount, slippageBps })
      
      const params = new URLSearchParams({
        inputMint: inputMint.toString(),
        outputMint: outputMint.toString(),
        amount: amount.toString(),
        slippageBps: slippageBps.toString(),
        ...(taker && { taker: taker.toString() })
      })
      
      const response = await fetch(`/api/jupiter/quote?${params}`)
      
      if (!response.ok) {
        console.error('❌ Jupiter API Error:', response.status, response.statusText)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const quote = await response.json()
      console.log('✅ Quote received from Jupiter API:', quote)
      return quote
      
    } catch (error: any) {
      console.error('❌ Quote error:', error)
      console.error('❌ Error details:', {
        message: error?.message,
        stack: error?.stack
      })
      
      throw new Error(`Failed to get quote from Jupiter API: ${error.message}`)
    }
  }

  // Get swap transaction using Jupiter API via proxy
  async getSwapTransaction(quoteResponse: any, userPublicKey: string) {
    try {
      console.log('🔧 Building swap transaction using Jupiter API via proxy...')
      
      const swapRequest = {
        quoteResponse,
        userPublicKey,
        wrapAndUnwrapSol: true
      }
      
      const response = await fetch('/api/jupiter/swap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(swapRequest),
        signal: AbortSignal.timeout(15000) // 15 second timeout
      })
      
      console.log('📡 Jupiter swap response status:', response.status, response.statusText)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Jupiter swap API error:', response.status, errorText)
        throw new Error(`Jupiter swap API error: ${response.status} ${response.statusText} - ${errorText}`)
      }
      
      const swapData = await response.json()
      console.log('✅ Swap transaction received from Jupiter API:', swapData)
      return swapData
      
    } catch (error) {
      console.error('❌ Swap transaction error:', error)
      throw new Error('Failed to build swap transaction with Jupiter API')
    }
  }


  // Execute Jupiter flow: quote → swap → sign → execute
  async executeSwap(
    quoteResponse: any,
    userPublicKey: string,
    signTransaction: (transaction: any) => Promise<any>
  ): Promise<string> {
    try {
      console.log('🚀 Starting Jupiter execute flow: quote → swap → sign → execute')
      
      // Step 1: Get swap transaction from Jupiter API
      console.log('🔧 Step 1: Getting swap transaction from Jupiter API...')
      const swapData = await this.getSwapTransaction(quoteResponse, userPublicKey)
      
      const swapTransactionBase64 = swapData.swapTransaction
      
      if (!swapTransactionBase64) {
        throw new Error('No swap transaction found in response')
      }
      
      console.log('📝 Step 2: Deserializing swap transaction...')
      
      // Step 2: Deserialize the transaction
      const { VersionedTransaction } = await import('@solana/web3.js')
      const swapTransactionBuf = Buffer.from(swapTransactionBase64, 'base64')
      const transaction = VersionedTransaction.deserialize(swapTransactionBuf)
      
      console.log('✍️ Step 3: Signing transaction with wallet...')
      
      // Step 3: Sign the transaction using the wallet adapter
      const signedTransaction = await signTransaction(transaction)
      
      console.log('🌐 Step 4: Executing transaction on Solana...')
      
      // Step 4: Execute the transaction on Solana
      const latestBlockHash = await this.connection.getLatestBlockhash()
      
      // Serialize and send the transaction
      const rawTransaction = signedTransaction.serialize()
      const txid = await this.connection.sendRawTransaction(rawTransaction, {
        skipPreflight: true,
        maxRetries: 2
      })
      
      // Confirm the transaction
      await this.connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: txid
      })
      
      console.log('✅ Jupiter execute flow completed successfully!')
      console.log('📝 Transaction signature:', txid)
      console.log('🔗 View on Solscan:', `https://solscan.io/tx/${txid}`)
      
      return txid
      
    } catch (error: any) {
      console.error('💥 Fatal error in Jupiter execute flow:')
      console.error('📊 Error object:', {
        name: error?.name,
        message: error?.message,
        stack: error?.stack,
        cause: error?.cause
      })
      
      if (error instanceof Error) {
        throw new Error(`Failed to execute Jupiter flow: ${error.message}`)
      }
      throw new Error('Failed to execute Jupiter flow')
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