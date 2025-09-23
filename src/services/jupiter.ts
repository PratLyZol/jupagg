import axios from 'axios'
import { Connection, Transaction, VersionedTransaction, PublicKey } from '@solana/web3.js'
import { QuoteResponse, SwapRequest, SwapResponse, Token } from '../types'
import JSBI from 'jsbi'

const JUPITER_API_BASE = 'https://quote-api.jup.ag/v6'
const JUPITER_TOKEN_API = 'https://lite-api.jup.ag/tokens/v1'

// Jupiter SDK-like implementation using direct API calls
export class JupiterSDK {
  private connection: Connection
  private tokens: Token[] = []

  constructor(connection: Connection) {
    this.connection = connection
    // Override connection to use Helius RPC endpoint
    this.connection = new Connection('https://mainnet.helius-rpc.com/?api-key=f9900790-e025-4245-b131-bf85cef5aa35', 'confirmed')
  }

  // Load tokens from Jupiter API
  async loadTokens(): Promise<Token[]> {
    try {
      console.log('🔄 Loading tokens from Jupiter API...')
      const response = await axios.get('https://token.jup.ag/strict')
      this.tokens = response.data
      console.log('✅ Loaded tokens:', this.tokens.length)
      return this.tokens
    } catch (error) {
      console.error('❌ Error loading tokens:', error)
      // Return fallback tokens
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

  // Get routes for a swap (similar to computeRoutes)
  async computeRoutes({
    inputMint,
    outputMint,
    amount,
    slippageBps = 50,
  }: {
    inputMint: PublicKey
    outputMint: PublicKey
    amount: JSBI
    slippageBps?: number
  }) {
    try {
      console.log('🔍 Computing routes with Jupiter API...')
      
      const params = new URLSearchParams({
        inputMint: inputMint.toString(),
        outputMint: outputMint.toString(),
        amount: amount.toString(),
        slippageBps: slippageBps.toString(),
        onlyDirectRoutes: 'true', // Force direct routes only
        asLegacyTransaction: 'true', // Force legacy transactions
        useSharedAccounts: 'false', // Disable shared accounts
        maxAccounts: '64', // Limit account count
      })

      const response = await fetch(`https://quote-api.jup.ag/v6/quote?${params}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const quote = await response.json()
      console.log('✅ Routes computed:', quote)

      // Convert to the expected format
      return {
        routesInfos: [{
          ...quote,
          outAmount: JSBI.BigInt(quote.outAmount),
          inAmount: JSBI.BigInt(quote.inAmount),
        }]
      }
    } catch (error) {
      console.error('❌ Error computing routes:', error)
      throw new Error('Failed to compute routes')
    }
  }

  // Exchange method (similar to jupiter.exchange)
  async exchange({ routeInfo }: { routeInfo: any }) {
    try {
      console.log('🔄 Preparing exchange...')
      
      // Convert routeInfo back to the format expected by the API
      const swapRequest = {
        quoteResponse: {
          ...routeInfo,
          outAmount: routeInfo.outAmount.toString(),
          inAmount: routeInfo.inAmount.toString(),
        },
        userPublicKey: '', // Will be set by the caller
        wrapAndUnwrapSol: true,
      }

      const response = await fetch('https://lite-api.jup.ag/swap/v1/swap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(swapRequest)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const swapResponse = await response.json()
      console.log('✅ Exchange prepared:', swapResponse)

      return {
        execute: async () => {
          return {
            txid: 'mock-txid', // This would be the actual transaction ID
            inputAddress: new PublicKey(routeInfo.inputMint),
            outputAddress: new PublicKey(routeInfo.outputMint),
            inputAmount: routeInfo.inAmount.toString(),
            outputAmount: routeInfo.outAmount.toString(),
          }
        }
      }
    } catch (error) {
      console.error('❌ Error preparing exchange:', error)
      throw new Error('Failed to prepare exchange')
    }
  }

  // Simplified quote method for our React component
  async quote(inputMint: string, outputMint: string, amount: string, slippageBps: number = 50) {
    try {
      console.log('🔍 Getting quote from Jupiter API...')
      
      const params = new URLSearchParams({
        inputMint,
        outputMint,
        amount,
        slippageBps: slippageBps.toString(),
      })

      const response = await fetch(`https://quote-api.jup.ag/v6/quote?${params}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const quoteData = await response.json()
      console.log('✅ Quote received:', quoteData)
      return quoteData
    } catch (error) {
      console.error('❌ Quote error:', error)
      throw new Error('Failed to get quote from Jupiter API')
    }
  }

  // Get swap transaction (simpler approach with pre-built transaction)
  async getSwapTransaction(quoteResponse: any, userPublicKey: string) {
    try {
      console.log('🔧 Building swap transaction with Jupiter API...')
      
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
      console.log('✅ Swap transaction built successfully:', swapResponse)
      return swapResponse
    } catch (error) {
      console.error('❌ Swap transaction error:', error)
      throw new Error('Failed to build swap transaction')
    }
  }

  // Execute swap using pre-built transaction approach
  async executeSwap(
    quoteResponse: any,
    userPublicKey: string,
    signTransaction: (transaction: VersionedTransaction) => Promise<VersionedTransaction>
  ): Promise<string> {
    try {
      console.log('🚀 Starting Jupiter pre-built transaction swap execution...')
      
      // Get fresh quote to ensure we have current data
      console.log('🔄 Getting fresh quote...')
      const freshQuote = await this.quote(
        quoteResponse.inputMint,
        quoteResponse.outputMint,
        quoteResponse.inAmount,
        50 // 0.5% slippage
      )
      console.log('✅ Fresh quote obtained')
      
      // Get swap transaction with fresh quote
      const swapResponse = await this.getSwapTransaction(freshQuote, userPublicKey)
      
      // Deserialize the transaction
      console.log('📦 Deserializing transaction...')
      const transactionBase64 = swapResponse.swapTransaction
      console.log('🔍 Transaction base64 length:', transactionBase64.length)
      console.log('🔍 Swap response keys:', Object.keys(swapResponse))
      
      const transaction = VersionedTransaction.deserialize(Buffer.from(transactionBase64, 'base64'))
      console.log('✅ Transaction deserialized successfully')
      console.log('🔍 Transaction details:', {
        message: !!transaction.message,
        signatures: transaction.signatures.length,
        messageType: transaction.message?.constructor?.name
      })

      // Sign the transaction
      console.log('✍️ Signing transaction...')
      const signedTransaction = await signTransaction(transaction)
      console.log('✅ Transaction signed successfully')

      // Serialize the signed transaction
      const transactionBinary = signedTransaction.serialize()
      console.log('📦 Transaction serialized, size:', transactionBinary.length, 'bytes')

      // Skip simulation to avoid BlockhashNotFound issues
      console.log('⚠️ Skipping simulation to avoid BlockhashNotFound issues...')
      console.log('📋 Transaction will be sent directly to the network')

      // Send the transaction to the Solana network
      console.log('📤 Sending transaction to Solana network...')
      const signature = await this.connection.sendTransaction(signedTransaction, {
        maxRetries: 3,
        skipPreflight: false,
        preflightCommitment: 'processed',
      })

      console.log('🎉 Transaction sent successfully!')
      console.log('📝 Transaction signature:', signature)
      console.log('🔗 View on Solscan:', `https://solscan.io/tx/${signature}`)

      // Confirm the transaction with longer timeout
      console.log('⏳ Confirming transaction...')
      try {
        const confirmation = await this.connection.confirmTransaction({
          signature: signature,
          blockhash: (await this.connection.getLatestBlockhash()).blockhash,
          lastValidBlockHeight: (await this.connection.getLatestBlockhash()).lastValidBlockHeight
        }, 'confirmed')

        if (confirmation.value.err) {
          console.error('❌ Transaction failed:', confirmation.value.err)
          throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`)
        } else {
          console.log('✅ Transaction successful!')
          console.log('🔗 View on Solscan:', `https://solscan.io/tx/${signature}`)
        }
      } catch (confirmError) {
        // If confirmation times out, check if transaction exists
        console.warn('⚠️ Confirmation timed out, checking transaction status...')
        try {
          const txStatus = await this.connection.getSignatureStatus(signature)
          if (txStatus.value?.confirmationStatus) {
            console.log('✅ Transaction found with status:', txStatus.value.confirmationStatus)
            console.log('🔗 View on Solscan:', `https://solscan.io/tx/${signature}`)
            // Don't throw error if transaction exists
          } else {
            console.log('⚠️ Transaction status unknown, but signature was generated')
            console.log('🔗 Check manually on Solscan:', `https://solscan.io/tx/${signature}`)
          }
        } catch (statusError) {
          console.warn('⚠️ Could not check transaction status:', statusError)
          console.log('🔗 Check manually on Solscan:', `https://solscan.io/tx/${signature}`)
        }
      }

      return signature
    } catch (error: any) {
      console.error('💥 Fatal error in swap execution:')
      console.error('📊 Error object:', {
        name: error?.name,
        message: error?.message,
        stack: error?.stack,
        cause: error?.cause
      })
      
      if (error instanceof Error) {
        throw new Error(`Failed to execute swap transaction: ${error.message}`)
      }
      throw new Error('Failed to execute swap transaction')
    }
  }
}

export class JupiterService {
  private static instance: JupiterService

  public static getInstance(): JupiterService {
    if (!JupiterService.instance) {
      JupiterService.instance = new JupiterService()
    }
    return JupiterService.instance
  }

  async getQuote(
    inputMint: string,
    outputMint: string,
    amount: string,
    slippageBps: number = 50
  ): Promise<QuoteResponse> {
    try {
      const response = await axios.get(`${JUPITER_API_BASE}/quote`, {
        params: {
          inputMint,
          outputMint,
          amount,
          slippageBps,
          onlyDirectRoutes: true, // Use only direct routes to avoid complex routing that might use address lookup tables
          asLegacyTransaction: true, // Force legacy transactions to avoid address lookup tables
        },
      })
      return response.data
    } catch (error) {
      console.error('Error fetching quote:', error)
      throw new Error('Failed to fetch quote from Jupiter API')
    }
  }

  async getSwapTransaction(swapRequest: SwapRequest): Promise<SwapResponse> {
    try {
      const response = await axios.post(`${JUPITER_API_BASE}/swap`, swapRequest)
      return response.data
    } catch (error) {
      console.error('Error building swap transaction:', error)
      throw new Error('Failed to build swap transaction')
    }
  }

  async getTokens(): Promise<Token[]> {
    try {
      // Try the new Jupiter Token API first
      const response = await axios.get(`${JUPITER_TOKEN_API}/mints/tradable`)
      console.log('Jupiter Token API response:', response.data.length, 'tokens')
      
      // For now, let's use a curated list of popular tokens with their metadata
      const popularTokens: Token[] = [
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
          name: 'POPCAT',
          decimals: 9,
        },
        {
          address: 'MangoCzJ36AjZyKwVj3VnYU4geOnzJcgAStAeJ4Vz',
          symbol: 'MNGO',
          name: 'Mango',
          decimals: 6,
        },
        {
          address: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
          symbol: 'JUP',
          name: 'Jupiter',
          decimals: 6,
        },
        {
          address: '5oVNBeEEQvYi1cX3ir8Dx5n1P7pdxydbGF2X4TxVusJm',
          symbol: 'WEN',
          name: 'Wen',
          decimals: 5,
        },
      ]
      
      return popularTokens
    } catch (error) {
      console.error('Error fetching tokens from Jupiter API:', error)
      
      // Fallback to a basic token list if API fails
      console.log('Using fallback token list')
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
      ]
    }
  }

  async getTokenPrice(tokenMint: string): Promise<number> {
    try {
      const response = await axios.get(`${JUPITER_API_BASE}/price`, {
        params: {
          ids: tokenMint,
        },
      })
      return response.data.data[tokenMint]?.price || 0
    } catch (error) {
      console.error('Error fetching token price:', error)
      return 0
    }
  }


  async executeSwap(
    swapResponse: SwapResponse,
    connection: Connection,
    signTransaction: (transaction: VersionedTransaction) => Promise<VersionedTransaction>
  ): Promise<string> {
    try {
      console.log('🚀 Starting swap execution...')
      console.log('📊 Swap Response Details:', {
        inputMint: swapResponse.inputMint,
        inAmount: swapResponse.inAmount,
        outputMint: swapResponse.outputMint,
        outAmount: swapResponse.outAmount,
        otherAmountThreshold: swapResponse.otherAmountThreshold,
        swapMode: swapResponse.swapMode,
        slippageBps: swapResponse.slippageBps,
        platformFee: swapResponse.platformFee,
        priceImpactPct: swapResponse.priceImpactPct,
        routePlan: swapResponse.routePlan?.length || 0
      })
      
      // Check connection status
      console.log('🔗 Connection endpoint:', connection.rpcEndpoint)
      
      // Test connection using Solana web3.js methods
      console.log('🌐 Testing connection using Solana web3.js...')
      try {
        const version = await connection.getVersion()
        console.log('✅ Connection test passed:', version)
      } catch (connError: any) {
        console.error('❌ Connection test failed:', connError)
        throw new Error(`Cannot reach Solana RPC endpoint: ${connError.message}. Please check your internet connection.`)
      }
      
      // Deserialize the transaction
      console.log('📦 Deserializing transaction...')
      const swapTransactionBuf = Buffer.from(swapResponse.swapTransaction, 'base64')
      console.log('📏 Transaction buffer size:', swapTransactionBuf.length, 'bytes')
      
      let transaction: Transaction | VersionedTransaction
      let isLegacy = false
      
      try {
        // Try to deserialize as legacy transaction first
        console.log('🔧 Attempting legacy transaction deserialization...')
        transaction = Transaction.from(swapTransactionBuf)
        isLegacy = true
        console.log('✅ Legacy transaction deserialized successfully')
        console.log('📋 Transaction details:', {
          instructions: transaction.instructions.length,
          signatures: transaction.signatures?.length || 0
        })
      } catch (legacyError: any) {
        // If that fails, try as versioned transaction
        console.log('🔄 Legacy deserialization failed, trying versioned...')
        console.log('📊 Legacy error:', legacyError.message)
        transaction = new VersionedTransaction(swapTransactionBuf)
        isLegacy = false
        console.log('✅ Versioned transaction deserialized successfully')
        console.log('📋 Transaction details:', {
          version: transaction.version,
          message: transaction.message ? 'Present' : 'Missing',
          signatures: transaction.signatures?.length || 0
        })
      }

      // Sign the transaction
      console.log('✍️ Signing transaction...')
      let signedTransaction: Transaction | VersionedTransaction
      
      if (isLegacy) {
        // For legacy transactions, convert to versioned for wallet signing
        console.log('🔧 Converting legacy transaction for wallet signing...')
        const versionedTransaction = new VersionedTransaction(
          (transaction as Transaction).serialize({
            requireAllSignatures: false,
            verifySignatures: false
          })
        )
        signedTransaction = await signTransaction(versionedTransaction)
        console.log('✅ Legacy transaction converted and signed successfully')
      } else {
        // For versioned transactions, sign directly
        console.log('🔧 Signing versioned transaction directly...')
        signedTransaction = await signTransaction(transaction as VersionedTransaction)
        console.log('✅ Versioned transaction signed successfully')
      }
      
      console.log('🔏 Signed transaction signatures:', signedTransaction.signatures?.length || 0)

      // Send the transaction with retry logic
      console.log('📤 Sending transaction to network...')
      let signature: string
      let retries = 3
      
      while (retries > 0) {
        try {
          console.log(`🔄 Attempt ${4 - retries}/3 - Sending transaction...`)
          
          // Get recent blockhash before sending
          const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed')
          console.log('📦 Latest blockhash:', blockhash)
          console.log('📊 Last valid block height:', lastValidBlockHeight)
          
          // First, simulate the transaction to check for issues
          console.log('🧪 Simulating transaction before sending...')
          try {
            const simulation = await connection.simulateTransaction(signedTransaction, {
              commitment: 'confirmed',
              sigVerify: false
            })
            console.log('✅ Simulation successful:', {
              value: simulation.value,
              err: simulation.value.err,
              logs: simulation.value.logs?.slice(0, 5) // Show first 5 logs
            })
            
            if (simulation.value.err) {
              console.error('❌ Simulation failed with error:', simulation.value.err)
              console.error('📋 Simulation logs:', simulation.value.logs)
              throw new Error(`Transaction simulation failed: ${JSON.stringify(simulation.value.err)}`)
            }
          } catch (simError) {
            console.error('❌ Simulation error:', simError)
            throw simError
          }
          
          signature = await connection.sendTransaction(signedTransaction, {
            skipPreflight: false,
            preflightCommitment: 'confirmed',
            maxRetries: 3,
          })
          
          console.log('🎉 Transaction sent successfully!')
          console.log('📝 Transaction signature:', signature)
          console.log('🔗 View on Solscan:', `https://solscan.io/tx/${signature}`)
          break
        } catch (sendError: any) {
          console.error(`❌ Transaction send attempt failed (${4 - retries}/3):`)
          console.error('📊 Error details:', {
            name: sendError?.name,
            message: sendError?.message,
            code: sendError?.code,
            logs: sendError?.logs || 'No logs available'
          })
          
          // Log specific error types
          if (sendError?.message?.includes('403')) {
            console.error('🚫 403 Forbidden - RPC endpoint access denied')
          } else if (sendError?.message?.includes('429')) {
            console.error('⏰ 429 Rate Limited - Too many requests')
          } else if (sendError?.message?.includes('timeout')) {
            console.error('⏱️ Timeout - Request took too long')
          } else if (sendError?.message?.includes('CORS')) {
            console.error('🌐 CORS Error - Cross-origin request blocked')
          }
          
          retries--
          if (retries === 0) {
            console.error('💥 All retry attempts exhausted')
            throw sendError
          }
          
          console.log(`⏳ Waiting 1 second before retry ${4 - retries}...`)
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }

      // Wait for confirmation
      console.log('⏳ Waiting for transaction confirmation...')
      try {
        const confirmation = await connection.confirmTransaction({
          signature: signature!,
          blockhash: (await connection.getLatestBlockhash()).blockhash,
          lastValidBlockHeight: (await connection.getLatestBlockhash()).lastValidBlockHeight
        })
        console.log('✅ Transaction confirmed:', confirmation)
      } catch (confirmError) {
        console.warn('⚠️ Confirmation check failed, but transaction may still succeed:', confirmError)
      }

      return signature!
    } catch (error: any) {
      console.error('💥 Fatal error in swap execution:')
      console.error('📊 Error object:', {
        name: error?.name,
        message: error?.message,
        stack: error?.stack,
        cause: error?.cause
      })
      
      if (error instanceof Error) {
        throw new Error(`Failed to execute swap transaction: ${error.message}`)
      }
      throw new Error('Failed to execute swap transaction')
    }
  }

}

export const jupiterService = JupiterService.getInstance()
