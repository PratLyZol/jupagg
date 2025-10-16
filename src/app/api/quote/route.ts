import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const inputMint = searchParams.get('inputMint')
    const outputMint = searchParams.get('outputMint')
    const amount = searchParams.get('amount')
    const slippageBps = searchParams.get('slippageBps')

    if (!inputMint || !outputMint || !amount) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    console.log('🔍 Proxying quote request:', { inputMint, outputMint, amount, slippageBps })

    // Create the Jupiter API URL
    const jupiterParams = new URLSearchParams({
      inputMint,
      outputMint,
      amount,
      ...(slippageBps && { slippageBps })
    })

    const jupiterUrl = `https://lite-api.jup.ag/swap/v1/quote?${jupiterParams}`
    console.log('🌐 Jupiter API URL:', jupiterUrl)

    // Make request to Jupiter API
    const response = await fetch(jupiterUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'JupAgg/1.0.0',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })

    console.log('📡 Jupiter response status:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Jupiter API error:', response.status, errorText)
      
      return NextResponse.json(
        { 
          error: `Jupiter API error: ${response.status} ${response.statusText}`,
          details: errorText
        },
        { status: response.status }
      )
    }

    const quoteData = await response.json()
    console.log('✅ Quote received from Jupiter API')
    
    return NextResponse.json(quoteData)
  } catch (error: any) {
    console.error('❌ Quote API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message 
      },
      { status: 500 }
    )
  }
}
