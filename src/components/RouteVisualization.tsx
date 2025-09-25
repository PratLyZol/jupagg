import React from 'react'
import { ArrowRight, Info, ExternalLink } from 'lucide-react'

interface RouteStep {
  fromToken: string
  toToken: string
  protocol: string
  pool?: string
}

interface RouteVisualizationProps {
  routePlan: any[]
  fromToken: any
  toToken: any
  priceImpact: number
  isVisible: boolean
  onToggle: () => void
}

const RouteVisualization: React.FC<RouteVisualizationProps> = ({
  routePlan,
  fromToken,
  toToken,
  priceImpact,
  isVisible,
  onToggle
}) => {
  const getProtocolName = (swapInfo: any) => {
    // Map Jupiter protocol IDs to readable names
    const protocolMap: { [key: string]: string } = {
      'Jupiter': 'Jupiter',
      'Raydium': 'Raydium',
      'Orca': 'Orca',
      'Serum': 'Serum',
      'Saber': 'Saber',
      'Mercurial': 'Mercurial',
      'Aldrin': 'Aldrin',
      'Crema': 'Crema',
      'Lifinity': 'Lifinity',
      'Cykura': 'Cykura',
      'Whirlpool': 'Whirlpool',
      'Invariant': 'Invariant',
      'Meteora': 'Meteora',
      'Stepn': 'Stepn',
      'Cropper': 'Cropper',
      'Balanace': 'Balanace',
      'Dradex': 'Dradex',
      'Lifinity V2': 'Lifinity V2',
      'Raydium CLMM': 'Raydium CLMM',
      'OpenBook': 'OpenBook',
      'Phoenix': 'Phoenix',
      'Symmetry': 'Symmetry',
      'Token-2022': 'Token-2022',
      'PumpFun': 'PumpFun',
      'Meteora DLMM': 'Meteora DLMM',
      'Kamino': 'Kamino',
      'Whirlpools': 'Whirlpools',
      'Invariant V2': 'Invariant V2',
      'Meteora Concentrated': 'Meteora Concentrated',
      'Meteora Stable': 'Meteora Stable',
      'Meteora CLMM': 'Meteora CLMM',
      'Meteora DLMM V2': 'Meteora DLMM V2',
      'Meteora CLMM V2': 'Meteora CLMM V2',
      'Meteora Stable V2': 'Meteora Stable V2',
      'Meteora Concentrated V2': 'Meteora Concentrated V2',
      'Meteora DLMM V3': 'Meteora DLMM V3',
      'Meteora CLMM V3': 'Meteora CLMM V3',
      'Meteora Stable V3': 'Meteora Stable V3',
      'Meteora Concentrated V3': 'Meteora Concentrated V3',
      'Meteora DLMM V4': 'Meteora DLMM V4',
      'Meteora CLMM V4': 'Meteora CLMM V4',
      'Meteora Stable V4': 'Meteora Stable V4',
      'Meteora Concentrated V4': 'Meteora Concentrated V4',
      'Meteora DLMM V5': 'Meteora DLMM V5',
      'Meteora CLMM V5': 'Meteora CLMM V5',
      'Meteora Stable V5': 'Meteora Stable V5',
      'Meteora Concentrated V5': 'Meteora Concentrated V5',
      'Meteora DLMM V6': 'Meteora DLMM V6',
      'Meteora CLMM V6': 'Meteora CLMM V6',
      'Meteora Stable V6': 'Meteora Stable V6',
      'Meteora Concentrated V6': 'Meteora Concentrated V6',
      'Meteora DLMM V7': 'Meteora DLMM V7',
      'Meteora CLMM V7': 'Meteora CLMM V7',
      'Meteora Stable V7': 'Meteora Stable V7',
      'Meteora Concentrated V7': 'Meteora Concentrated V7',
      'Meteora DLMM V8': 'Meteora DLMM V8',
      'Meteora CLMM V8': 'Meteora CLMM V8',
      'Meteora Stable V8': 'Meteora Stable V8',
      'Meteora Concentrated V8': 'Meteora Concentrated V8',
      'Meteora DLMM V9': 'Meteora DLMM V9',
      'Meteora CLMM V9': 'Meteora CLMM V9',
      'Meteora Stable V9': 'Meteora Stable V9',
      'Meteora Concentrated V9': 'Meteora Concentrated V9',
      'Meteora DLMM V10': 'Meteora DLMM V10',
      'Meteora CLMM V10': 'Meteora CLMM V10',
      'Meteora Stable V10': 'Meteora Stable V10',
      'Meteora Concentrated V10': 'Meteora Concentrated V10'
    }
    
    return protocolMap[swapInfo?.label] || swapInfo?.label || 'Unknown'
  }

  const getPriceImpactColor = (impact: number) => {
    if (impact <= 0.1) return 'text-green-400'
    if (impact <= 0.5) return 'text-yellow-400'
    if (impact <= 1.0) return 'text-orange-400'
    return 'text-red-400'
  }

  const getPriceImpactWarning = (impact: number) => {
    if (impact > 5.0) return '⚠️ Very high price impact'
    if (impact > 1.0) return '⚠️ High price impact'
    if (impact > 0.5) return '⚠️ Medium price impact'
    return ''
  }

  if (!routePlan || routePlan.length === 0) return null

  return (
    <div className="space-y-3">
      {/* Route header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onToggle}
          className="flex items-center gap-2 text-sm font-medium hover:opacity-80 transition-opacity"
        >
          <span style={{ color: 'white' }}>Route Details</span>
          <Info className="w-4 h-4" style={{ color: 'white' }} />
        </button>
        
        <div className="flex items-center gap-4 text-sm">
          <span style={{ color: 'white' }}>
            {routePlan.length} hop{routePlan.length > 1 ? 's' : ''}
          </span>
          <span className={getPriceImpactColor(priceImpact)}>
            {priceImpact.toFixed(2)}% impact
          </span>
        </div>
      </div>

      {/* Price impact warning */}
      {getPriceImpactWarning(priceImpact) && (
        <div className="p-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
          <p className="text-yellow-200 text-xs">{getPriceImpactWarning(priceImpact)}</p>
        </div>
      )}

      {/* Route visualization */}
      {isVisible && (
        <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4 space-y-3">
          {/* Start token */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {fromToken?.symbol?.charAt(0) || '?'}
              </span>
            </div>
            <div>
              <div style={{ color: 'white', fontSize: '0.875rem', fontWeight: '500' }}>
                {fromToken?.symbol || 'Unknown'}
              </div>
              <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                {fromToken?.name || 'Unknown Token'}
              </div>
            </div>
          </div>

          {/* Route steps */}
          {routePlan.map((step, index) => (
            <div key={index} className="flex items-center gap-3">
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <div className="flex-1 bg-gray-700/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span style={{ color: 'white', fontSize: '0.875rem', fontWeight: '500' }}>
                    {getProtocolName(step.swapInfo)}
                  </span>
                  {step.swapInfo?.label && (
                    <a
                      href={`https://jup.ag/swap/${step.swapInfo.label}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1"
                    >
                      Info
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                {step.swapInfo?.pool && (
                  <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                    Pool: {step.swapInfo.pool.slice(0, 8)}...
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* End token */}
          <div className="flex items-center gap-3">
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {toToken?.symbol?.charAt(0) || '?'}
              </span>
            </div>
            <div>
              <div style={{ color: 'white', fontSize: '0.875rem', fontWeight: '500' }}>
                {toToken?.symbol || 'Unknown'}
              </div>
              <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                {toToken?.name || 'Unknown Token'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RouteVisualization
