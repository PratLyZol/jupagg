import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const inputMint = searchParams.get('inputMint')
    const outputMint = searchParams.get('outputMint')
    const amount = searchParams.get('amount')
    const slippageBps = searchParams.get('slippageBps') || '50'

    if (!inputMint || !outputMint || !amount) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const params = new URLSearchParams({
      inputMint,
      outputMint,
      amount,
      slippageBps,
    })

    // Official Jupiter API endpoint from documentation
    const jupiterUrl = `https://quote-api.jup.ag/v6/quote?${params}`
    console.log('🌐 Server-side fetching from Jupiter:', jupiterUrl)

    try {
      const response = await fetch(jupiterUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0',
        },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      })

      console.log('📡 Jupiter API Response:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Jupiter API Error:', response.status, errorText)
        return NextResponse.json(
          { 
            error: `Jupiter API error: ${response.status}`, 
            details: errorText,
            suggestion: 'Using mock data instead'
          },
          { status: response.status }
        )
      }

      const data = await response.json()
      console.log('✅ Successfully fetched quote from Jupiter')
      return NextResponse.json(data)
      
    } catch (fetchError: any) {
      console.error('❌ Fetch Error:', fetchError)
      console.error('Error details:', {
        message: fetchError.message,
        code: fetchError.code,
        cause: fetchError.cause
      })
      
      return NextResponse.json(
        { 
          error: 'Failed to reach Jupiter API', 
          details: fetchError.message,
          suggestion: 'Network issue - check if quote-api.jup.ag is accessible from your network'
        },
        { status: 503 }
      )
    }
  } catch (error: any) {
    console.error('❌ Quote API Route Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// Use Node.js runtime for better DNS resolution
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'