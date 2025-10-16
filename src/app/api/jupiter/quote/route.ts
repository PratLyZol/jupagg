import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const inputMint = searchParams.get('inputMint')
    const outputMint = searchParams.get('outputMint')
    const amount = searchParams.get('amount')
    const slippageBps = searchParams.get('slippageBps')
    const taker = searchParams.get('taker')
    const onlyDirectRoutes = searchParams.get('onlyDirectRoutes')
    const asLegacyTransaction = searchParams.get('asLegacyTransaction')
    const useSharedAccounts = searchParams.get('useSharedAccounts')
    const maxAccounts = searchParams.get('maxAccounts')

    if (!inputMint || !outputMint || !amount) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    console.log('🔍 Proxying Jupiter quote request:', { 
      inputMint, 
      outputMint, 
      amount, 
      slippageBps 
    })

    // Create the Jupiter API URL with essential parameters only
    const jupiterParams = new URLSearchParams({
      inputMint,
      outputMint,
      amount,
      ...(slippageBps && { slippageBps }),
      ...(taker && { taker })
    })

    const jupiterUrl = `https://lite-api.jup.ag/swap/v1/quote?${jupiterParams}`
    console.log('🌐 Jupiter API URL:', jupiterUrl)

    // Make request to Jupiter API
    const response = await fetch(jupiterUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'JupAgg/1.0.0',
        ...(process.env.NEXT_PUBLIC_JUPITER_API_KEY && {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_JUPITER_API_KEY}`
        })
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })

    console.log('📡 Jupiter response status:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Jupiter API error:', response.status, response.statusText)
      console.error('❌ Error response body:', errorText)
      console.error('❌ Request URL:', jupiterUrl)
      
      if (response.status === 401) {
        return NextResponse.json(
          { 
            error: 'Jupiter API requires authentication',
            message: 'Please set NEXT_PUBLIC_JUPITER_API_KEY in your environment variables',
            details: 'Get your API key from: https://dev.jup.ag/'
          },
          { status: 401 }
        )
      }
      
      return NextResponse.json(
        { 
          error: `Jupiter API error: ${response.status} ${response.statusText}`,
          details: errorText,
          url: jupiterUrl
        },
        { status: response.status }
      )
    }

    const quoteData = await response.json()
    console.log('✅ Quote received from Jupiter API')
    
    return NextResponse.json(quoteData)
  } catch (error: any) {
    console.error('❌ Quote API error:', error)
    console.error('❌ Error stack:', error.stack)
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      cause: error.cause
    })
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message,
        stack: error.stack
      },
      { status: 500 }
    )
  }
}