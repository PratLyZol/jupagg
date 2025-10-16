export interface Token {
  address: string
  symbol: string
  name: string
  decimals: number
  logoURI?: string
}

export interface QuoteResponse {
  inputMint: string
  inAmount: string
  outputMint: string
  outAmount: string
  otherAmountThreshold: string
  swapMode: string
  slippageBps: number
  platformFee?: {
    amount: string
    feeBps: number
  }
  priceImpactPct: string
  routePlan: Array<{
    swapInfo: {
      ammKey: string
      label: string
      inputMint: string
      inAmount: string
      outputMint: string
      outAmount: string
      notEnoughLiquidity: boolean
      minInAmount: string
      minOutAmount: string
      priceImpactPct: string
      lpFee: {
        amount: string
        mint: string
        pct: number
      }
      platformFee: {
        amount: string
        mint: string
        pct: number
      }
    }
    percent: number
  }>
  contextSlot: number
  timeTaken: number
}

export interface SwapRequest {
  quoteResponse: QuoteResponse
  userPublicKey: string
  wrapAndUnwrapSol?: boolean
  useSharedAccounts?: boolean
  feeAccount?: string
  trackingAccount?: string
  computeUnitLimit?: number
  prioritizationFeeLamports?: number
}

export interface SwapResponse {
  swapTransaction: string
  lastValidBlockHeight: number
  prioritizationFeeLamports: number
}

export interface SwapError {
  error: string
  message: string
}