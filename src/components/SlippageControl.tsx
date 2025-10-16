'use client'

import React, { useState } from 'react'
import { Settings, X, Info } from 'lucide-react'

interface SlippageControlProps {
  slippage: number
  onSlippageChange: (slippage: number) => void
}

const SlippageControl: React.FC<SlippageControlProps> = ({ slippage, onSlippageChange }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [customValue, setCustomValue] = useState('')
  const [showTooltip, setShowTooltip] = useState(false)

  const presets = [
    { value: 0.1, label: '0.1%', description: 'Minimal' },
    { value: 0.5, label: '0.5%', description: 'Low' },
    { value: 1.0, label: '1.0%', description: 'Medium' },
    { value: 3.0, label: '3.0%', description: 'High' },
  ]

  const handlePresetClick = (preset: number) => {
    onSlippageChange(preset)
    setCustomValue('')
  }

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCustomValue(value)
    
    const numValue = parseFloat(value)
    if (!isNaN(numValue) && numValue >= 0.01 && numValue <= 50) {
      onSlippageChange(numValue)
    }
  }

  const getSlippageStatus = (slippage: number) => {
    if (slippage <= 0.5) return { color: '#22c55e', text: 'Low Risk', bg: 'rgba(34, 197, 94, 0.1)' }
    if (slippage <= 1.0) return { color: '#fbbf24', text: 'Medium Risk', bg: 'rgba(251, 191, 36, 0.1)' }
    return { color: '#ef4444', text: 'High Risk', bg: 'rgba(239, 68, 68, 0.1)' }
  }

  const status = getSlippageStatus(slippage)

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 0.75rem',
          background: 'rgba(31, 41, 55, 0.6)',
          border: '1px solid rgba(75, 85, 99, 0.5)',
          borderRadius: '12px',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(55, 65, 81, 0.7)'
          e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(31, 41, 55, 0.6)'
          e.currentTarget.style.borderColor = 'rgba(75, 85, 99, 0.5)'
        }}
      >
        <Settings style={{ width: '1rem', height: '1rem', color: '#9ca3af' }} />
        <span style={{ color: 'white', fontSize: '0.875rem', fontWeight: '600' }}>
          {slippage}%
        </span>
      </button>
    )
  }

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: '1rem'
      }}
      onClick={() => setIsOpen(false)}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#1f2937',
          border: '1px solid rgba(75, 85, 99, 0.5)',
          borderRadius: '20px',
          padding: '1.5rem',
          maxWidth: '24rem',
          width: '100%',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Settings style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} />
            <h3 style={{ color: 'white', fontSize: '1.125rem', fontWeight: '700', margin: 0 }}>
              Slippage Settings
            </h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '0.25rem',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X style={{ width: '1.25rem', height: '1.25rem', color: '#9ca3af' }} />
          </button>
        </div>

        {/* Info Box */}
        <div 
          style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '12px',
            padding: '0.75rem',
            marginBottom: '1.25rem',
            display: 'flex',
            gap: '0.75rem'
          }}
        >
          <Info style={{ width: '1rem', height: '1rem', color: '#3b82f6', flexShrink: 0, marginTop: '0.125rem' }} />
          <p style={{ color: '#93c5fd', fontSize: '0.75rem', margin: 0, lineHeight: '1.4' }}>
            Slippage tolerance is the max price change you'll accept. Higher values increase success rates but may result in worse prices.
          </p>
        </div>

        {/* Current Status */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Current Setting</span>
            <div style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              background: status.bg,
              border: `1px solid ${status.color}`,
              fontSize: '0.75rem',
              fontWeight: '600',
              color: status.color
            }}>
              {status.text}
            </div>
          </div>
          <div style={{ 
            fontSize: '2rem', 
            fontWeight: '700', 
            color: 'white',
            textAlign: 'center',
            padding: '0.5rem',
            background: 'rgba(55, 65, 81, 0.5)',
            borderRadius: '12px',
            border: '1px solid rgba(75, 85, 99, 0.5)'
          }}>
            {slippage}%
          </div>
        </div>

        {/* Preset Buttons */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ color: '#9ca3af', fontSize: '0.875rem', fontWeight: '600', display: 'block', marginBottom: '0.75rem' }}>
            Quick Select
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            {presets.map((preset) => (
              <button
                key={preset.value}
                onClick={() => handlePresetClick(preset.value)}
                style={{
                  padding: '0.75rem',
                  background: slippage === preset.value 
                    ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' 
                    : 'rgba(55, 65, 81, 0.5)',
                  border: slippage === preset.value 
                    ? '2px solid #6366f1' 
                    : '1px solid rgba(75, 85, 99, 0.5)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
                onMouseEnter={(e) => {
                  if (slippage !== preset.value) {
                    e.currentTarget.style.background = 'rgba(75, 85, 99, 0.7)'
                    e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (slippage !== preset.value) {
                    e.currentTarget.style.background = 'rgba(55, 65, 81, 0.5)'
                    e.currentTarget.style.borderColor = 'rgba(75, 85, 99, 0.5)'
                  }
                }}
              >
                <span style={{ 
                  color: 'white', 
                  fontSize: '1.125rem', 
                  fontWeight: '700'
                }}>
                  {preset.label}
                </span>
                <span style={{ 
                  color: slippage === preset.value ? '#e0e7ff' : '#9ca3af', 
                  fontSize: '0.75rem'
                }}>
                  {preset.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Input */}
        <div>
          <label style={{ color: '#9ca3af', fontSize: '0.875rem', fontWeight: '600', display: 'block', marginBottom: '0.75rem' }}>
            Custom Slippage
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="number"
              placeholder="Enter custom %"
              value={customValue}
              onChange={handleCustomChange}
              min="0.01"
              max="50"
              step="0.1"
              style={{
                width: '100%',
                padding: '0.75rem 2.5rem 0.75rem 1rem',
                background: 'rgba(55, 65, 81, 0.5)',
                border: '1px solid rgba(75, 85, 99, 0.5)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '1rem',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#6366f1'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(75, 85, 99, 0.5)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
            <span style={{
              position: 'absolute',
              right: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af',
              fontSize: '1rem',
              fontWeight: '600'
            }}>
              %
            </span>
          </div>
          <p style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '0.5rem', marginBottom: 0 }}>
            Range: 0.01% - 50%
          </p>
        </div>

        {/* Warning for high slippage */}
        {slippage > 3 && (
          <div 
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              padding: '0.75rem',
              marginTop: '1rem',
              display: 'flex',
              gap: '0.75rem'
            }}
          >
            <span style={{ fontSize: '1rem' }}>⚠️</span>
            <p style={{ color: '#fca5a5', fontSize: '0.75rem', margin: 0, lineHeight: '1.4' }}>
              <strong>High slippage warning:</strong> Your transaction may complete at a significantly different price. Consider lowering your slippage tolerance.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SlippageControl