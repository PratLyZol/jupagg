import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { quoteResponse, userPublicKey, wrapAndUnwrapSol = true, prioritizationFeeLamports = 1000000 } = body

    if (!quoteResponse || !userPublicKey) {
      return NextResponse.json(
        { error: 'Missing required parameters: quoteResponse and userPublicKey' },
        { status: 400 }
      )
    }

    console.log('🔧 Proxying swap request:', { 
      userPublicKey, 
      wrapAndUnwrapSol, 
      prioritizationFeeLamports 
    })

    // Create the Jupiter API request body
    const swapRequest = {
      quoteResponse,
      userPublicKey,
      wrapAndUnwrapSol,
      dynamicComputeUnitLimit: true,
      prioritizationFeeLamports
    }

    console.log('🌐 Sending swap request to Jupiter API...')

    // Make request to Jupiter API
    const response = await fetch('https://lite-api.jup.ag/swap/v1/swap', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'JupAgg/1.0.0',
        'Accept': 'application/json',
      },
      body: JSON.stringify(swapRequest),
      signal: AbortSignal.timeout(15000), // 15 second timeout
    })

    console.log('📡 Jupiter swap response status:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Jupiter swap API error:', response.status, errorText)
      
      return NextResponse.json(
        { 
          error: `Jupiter swap API error: ${response.status} ${response.statusText}`,
          details: errorText
        },
        { status: response.status }
      )
    }

    const swapData = await response.json()
    console.log('✅ Swap transaction received from Jupiter API')
    
    return NextResponse.json(swapData)
  } catch (error: any) {
    console.error('❌ Swap API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message 
      },
      { status: 500 }
    )
  }
}
