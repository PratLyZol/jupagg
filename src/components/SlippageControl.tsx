import React, { useState } from 'react'
import { Settings, ChevronDown, ChevronUp } from 'lucide-react'

interface SlippageControlProps {
  slippage: number
  onSlippageChange: (slippage: number) => void
}

const SlippageControl: React.FC<SlippageControlProps> = ({ slippage, onSlippageChange }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [customSlippage, setCustomSlippage] = useState('')

  const presets = [0.1, 0.5, 1.0, 3.0]

  const handlePresetClick = (preset: number) => {
    onSlippageChange(preset)
    setCustomSlippage('')
    setIsOpen(false)
  }

  const handleCustomSubmit = () => {
    const value = parseFloat(customSlippage)
    if (!isNaN(value) && value >= 0 && value <= 50) {
      onSlippageChange(value)
      setIsOpen(false)
    }
  }

  const getSlippageColor = (slippage: number) => {
    if (slippage <= 0.5) return 'text-green-400'
    if (slippage <= 1.0) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getSlippageWarning = (slippage: number) => {
    if (slippage > 5.0) return '⚠️ High slippage risk'
    if (slippage > 1.0) return '⚠️ Medium slippage risk'
    return ''
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="slippage-button flex items-center justify-center gap-2 px-8 py-2 bg-gray-800/50 border border-gray-600 rounded-lg hover:bg-gray-700/50 transition-colors"
        style={{ minWidth: '300px', width: 'auto' }}
      >
        <Settings className="w-4 h-4 text-white" />
        <span className="text-white text-sm">
          Slippage: <span className={getSlippageColor(slippage)}>{slippage}%</span>
        </span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-white" />
        ) : (
          <ChevronDown className="w-4 h-4 text-white" />
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 glass p-4 z-50">
          <h3 className="text-white text-sm font-semibold mb-3">
            Slippage Tolerance
          </h3>
          
          {/* Preset buttons - 2x2 grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {presets.map((preset) => (
              <button
                key={preset}
                onClick={() => handlePresetClick(preset)}
                style={{
                  width: '100%',
                  padding: '1rem',
                  textAlign: 'center',
                  backgroundColor: slippage === preset ? 'rgba(99, 102, 241, 0.3)' : 'rgba(31, 41, 55, 0.4)',
                  border: slippage === preset ? '1px solid rgba(99, 102, 241, 0.6)' : '1px solid rgba(75, 85, 99, 0.3)',
                  borderRadius: '16px',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (slippage !== preset) {
                    e.currentTarget.style.backgroundColor = 'rgba(55, 65, 81, 0.7)'
                    e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (slippage !== preset) {
                    e.currentTarget.style.backgroundColor = 'rgba(31, 41, 55, 0.4)'
                    e.currentTarget.style.borderColor = 'rgba(75, 85, 99, 0.3)'
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }
                }}
              >
                <div style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '50%',
                  background: slippage === preset 
                    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.8), rgba(139, 92, 246, 0.8))'
                    : 'linear-gradient(135deg, rgba(75, 85, 99, 0.8), rgba(55, 65, 81, 0.8))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: 'bold',
                  boxShadow: slippage === preset ? '0 2px 8px rgba(99, 102, 241, 0.3)' : 'none'
                }}>
                  {preset}%
                </div>
                <div className="text-center">
                  <div style={{ color: 'white', fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                    {preset}% Slippage
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: '0.75rem', lineHeight: '1.2' }}>
                    {preset <= 0.5 ? 'Very safe for most trades' : 
                     preset <= 1.0 ? 'Safe for stable pairs' : 
                     preset <= 3.0 ? 'Moderate risk, watch price' : 
                     'High risk, use carefully'}
                  </div>
                </div>
                {slippage === preset && (
                  <div style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    width: '1.25rem',
                    height: '1.25rem',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.625rem',
                    fontWeight: 'bold'
                  }}>
                    ✓
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Custom slippage input */}
          <div className="space-y-2">
            <label className="text-white text-xs font-medium">
              Custom Slippage (%)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={customSlippage}
                onChange={(e) => setCustomSlippage(e.target.value)}
                placeholder="0.5"
                min="0"
                max="50"
                step="0.1"
                className="input flex-1 text-sm"
              />
              <button
                onClick={handleCustomSubmit}
                disabled={!customSlippage || parseFloat(customSlippage) < 0 || parseFloat(customSlippage) > 50}
                className="btn btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ padding: '0.5rem 1rem' }}
              >
                Set
              </button>
            </div>
          </div>

          {/* Warning message */}
          {getSlippageWarning(slippage) && (
            <div className="mt-3 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-200 text-xs">{getSlippageWarning(slippage)}</p>
            </div>
          )}

          {/* Info text */}
          <p className="slippage-info-text mt-3 text-white text-xs">
            Your transaction will revert if the price changes unfavorably by more than this percentage.
          </p>
        </div>
      )}
    </div>
  )
}

export default SlippageControl
