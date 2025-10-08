# Gill + Jupiter Swap Template

A Next.js-based Solana swap aggregator template using Gill and Jupiter API. This template provides a production-ready swap interface with wallet integration and an intuitive UI.

## Features

- 🚀 Built with **Next.js 14** and **TypeScript**
- 💳 **Solana wallet integration** (Phantom, Solflare, etc.)
- 🔄 **Jupiter API** for best swap routes
- ⚡ **Gill** for simplified Solana interactions
- 🎨 Beautiful **Tailwind CSS** styling
- 📱 Fully responsive design
- 🔐 Secure client-side wallet handling

## Prerequisites

- Node.js 20.11.1 or higher
- npm or yarn
- A Solana wallet (Phantom, Solflare, etc.)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
jupagg/
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout with metadata
│   │   ├── page.tsx         # Home page with swap interface
│   │   └── globals.css      # Global styles
│   ├── components/
│   │   ├── SwapInterface.tsx           # Main swap component
│   │   ├── TokenSelector.tsx           # Token selection dropdown
│   │   ├── SlippageControl.tsx         # Slippage settings
│   │   ├── RouteVisualization.tsx      # Route display
│   │   └── WalletContextProvider.tsx   # Wallet provider wrapper
│   ├── services/
│   │   ├── gill-jupiter.ts  # Gill-based Jupiter service
│   │   └── jupiter.ts       # Standard Jupiter service
│   └── types/
│       └── index.ts         # TypeScript interfaces
├── next.config.js           # Next.js configuration
├── tailwind.config.js       # Tailwind CSS config
├── tsconfig.json            # TypeScript config
└── package.json
```

## Key Components

### WalletContextProvider

Provides wallet adapter context to the entire application. Supports multiple wallet types and handles connection state.

### SwapInterface

The main swap component that:

- Fetches quotes from Jupiter API
- Displays token selection
- Handles swap execution
- Shows transaction status

### Gill Jupiter Service

Uses Gill for simplified Solana RPC interactions:

- Token loading
- Quote fetching
- Transaction signing and sending
- Transaction confirmation

## Configuration

### RPC Endpoint

The default RPC endpoint is configured in `src/components/WalletContextProvider.tsx`:

```typescript
const endpoint = "https://api.mainnet.solana.com";
```

You can change this to use:

- Helius: `https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY`
- QuickNode: Your QuickNode endpoint
- Any other RPC provider

### Supported Wallets

Default wallets are configured in `WalletContextProvider.tsx`:

- Phantom
- Solflare

Add more wallets by importing from `@solana/wallet-adapter-wallets`.

## Styling

The app uses Tailwind CSS with custom styles defined in `src/app/globals.css`. Key features:

- Dark theme with glass morphism effects
- Custom wallet adapter styling
- Responsive design
- Smooth animations and transitions

## API Integration

### Jupiter API

This template uses Jupiter's V6 Quote API for:

- Getting swap quotes
- Building swap transactions
- Route optimization

### Gill Integration

Gill simplifies Solana interactions with:

- Type-safe RPC calls
- Automatic transaction handling
- Built-in error handling

## Environment Variables

Create a `.env.local` file for configuration:

```env
NEXT_PUBLIC_SOLANA_RPC=https://api.mainnet.solana.com
```

## Troubleshooting

### Build Warnings

Some peer dependency warnings are normal due to wallet adapter dependencies. The app will still work correctly.

### Wallet Connection Issues

1. Make sure your wallet extension is installed
2. Refresh the page
3. Check that you're on the correct network (mainnet/devnet)

### Transaction Failures

1. Check your RPC endpoint is working
2. Ensure you have enough SOL for transaction fees
3. Try increasing slippage tolerance
4. Verify the tokens you're swapping are available

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Jupiter API Docs](https://station.jup.ag/docs/apis/swap-api)
- [Gill Documentation](https://github.com/solana-program/gill)
- [Solana Wallet Adapter](https://github.com/anza-xyz/wallet-adapter)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
