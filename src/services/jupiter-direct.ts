import { Connection, VersionedTransaction, PublicKey } from '@solana/web3.js'
import { Jupiter } from '@jup-ag/api'

// Direct Jupiter API implementation
export class JupiterDirectService {
  private connection: Connection

  private jupiter: Jupiter

  constructor() {
    // Initialize connection with Helius RPC
    this.connection = new Connection(
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
      'confirmed'
    )
    
    // Initialize Jupiter SDK
    this.jupiter = new Jupiter({
      connection: this.connection,
      cluster: 'mainnet-beta'
    })
  }

  // Get quote using Jupiter SDK
  async getQuote(
    inputMint: string,
    outputMint: string,
    amount: string,
    slippageBps: number = 50
  ) {
    try {
      console.log('🔍 Getting quote using Jupiter SDK...')
      console.log('📊 Quote params:', { inputMint, outputMint, amount, slippageBps })
      
      // Use Jupiter SDK to get quote
      const quote = await this.jupiter.getQuote({
        inputMint: new PublicKey(inputMint),
        outputMint: new PublicKey(outputMint),
        amount: BigInt(amount),
        slippageBps
      })

      console.log('✅ Quote received from Jupiter SDK:', quote)
      return quote
    } catch (error) {
      console.error('❌ Quote error:', error)
      throw new Error(`Failed to get quote: ${error}`)
    }
  }

  // Get swap transaction using Jupiter SDK
  async getSwapTransaction(quoteResponse: any, userPublicKey: string) {
    try {
      console.log('🔧 Building swap transaction using Jupiter SDK...')
      
      // Use Jupiter SDK to build swap transaction
      const { execute } = await this.jupiter.exchange({
        quoteResponse,
        userPublicKey: new PublicKey(userPublicKey),
        wrapAndUnwrapSol: true
      })

      console.log('✅ Swap transaction built with Jupiter SDK')
      return { execute }
    } catch (error) {
      console.error('❌ Swap transaction error:', error)
      throw new Error(`Failed to build swap transaction: ${error}`)
    }
  }

  // Execute the complete swap process
  async executeSwap(
    inputMint: string,
    outputMint: string,
    amount: string,
    slippageBps: number,
    wallet: any // Wallet adapter object
  ): Promise<string> {
    try {
      console.log('🚀 Starting Jupiter direct swap execution...')
      console.log('📊 Swap params:', { inputMint, outputMint, amount, slippageBps })
      
      // Step 1: Get quote
      console.log('📋 Step 1: Getting quote...')
      const quoteResponse = await this.getQuote(inputMint, outputMint, amount, slippageBps)
      
      // Step 2: Get swap transaction
      console.log('🔧 Step 2: Building swap transaction...')
      const { execute } = await this.getSwapTransaction(quoteResponse, wallet.publicKey.toString())
      
      // Step 3: Execute the swap using Jupiter SDK
      console.log('🚀 Step 3: Executing swap with Jupiter SDK...')
      const result = await execute()
      
      console.log('✅ Swap executed successfully!')
      console.log(`🔗 View on Solscan: https://solscan.io/tx/${result.txid}`)
      
      return result.txid
    } catch (error: any) {
      console.error('💥 Swap execution failed:', error)
      
      // Provide more specific error messages
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

  // Helper method to convert SOL amount to lamports
  static solToLamports(solAmount: number): string {
    return (solAmount * 1e9).toString()
  }

  // Helper method to convert lamports to SOL
  static lamportsToSol(lamports: string): number {
    return parseInt(lamports) / 1e9
  }
}

// Export singleton instance
export const jupiterDirectService = new JupiterDirectService()
