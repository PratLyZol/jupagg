# Gill + Jupiter Swap Template

A Next.js template for building Solana token swap applications using [Jupiter Plugin](https://station.jup.ag/docs/apis/swap-api) with [Gill](https://github.com/solana-developers/solana-rpc-get-started) wallet integration.

## Features

- ✨ **Jupiter Plugin Integration** - Embedded swap widget with best-in-class routing
- 🔐 **Wallet Passthrough** - Seamless wallet adapter integration using Gill
- 💰 **Referral Fees** - Configure referral rewards via environment variables
- ⚙️ **Customizable** - Set default tokens and network via env configuration
- 🎨 **Modern UI** - Built with Next.js 14, Tailwind CSS, and TypeScript

## Quick Start

### Prerequisites

- Node.js 18+ installed
- A Solana wallet (Phantom, Solflare, etc.)

### Installation

```bash
# Clone or scaffold with create-solana-dapp
npx create-solana-dapp@latest -t gh:solana-foundation/templates/community/gill-jupiter-swap

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see your swap interface!

## Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Solana RPC endpoint
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# Referral account (your wallet address)
NEXT_PUBLIC_JUP_REFERRAL_ACCOUNT=YourWalletAddressHere

# Referral fee (in basis points, max 100 = 1%)
NEXT_PUBLIC_JUP_REFERRAL_BPS=50

# Default tokens
NEXT_PUBLIC_DEFAULT_INPUT_MINT=So11111111111111111111111111111111111111112
NEXT_PUBLIC_DEFAULT_OUTPUT_MINT=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v

# Strict token list (true/false)
NEXT_PUBLIC_STRICT_TOKEN_LIST=false
```

### Wallet Passthrough Integration

This template uses **wallet passthrough**, meaning Jupiter Plugin automatically uses your connected wallet without requiring separate authentication. The wallet adapter is passed directly to Jupiter:

```typescript
window.Jupiter.init({
  passThroughWallet: wallet, // Solana wallet adapter
  // ... other config
});
```

**Benefits:**

- Single wallet connection for your entire dapp
- No duplicate wallet prompts
- Consistent user experience

### Referral Configuration

Earn referral fees on swaps by configuring your wallet address:

1. Set `NEXT_PUBLIC_JUP_REFERRAL_ACCOUNT` to your Solana wallet address
2. Set `NEXT_PUBLIC_JUP_REFERRAL_BPS` (1-100, where 100 = 1% fee)
3. Users swapping through your dapp will generate fees to your wallet

**Example:**

```env
NEXT_PUBLIC_JUP_REFERRAL_ACCOUNT=YourPublicKey123
NEXT_PUBLIC_JUP_REFERRAL_BPS=50  # 0.5% fee
```

**Note:** Referral fees are capped at 100 basis points (1%) by Jupiter.

### Token Mint Configuration

Configure default input/output tokens by setting mint addresses:

```env
NEXT_PUBLIC_DEFAULT_INPUT_MINT=So11111111111111111111111111111111111111112
NEXT_PUBLIC_DEFAULT_OUTPUT_MINT=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
```

#### Finding Token Mint Addresses

**Option 1: Solscan**

1. Visit [solscan.io](https://solscan.io/)
2. Search for your token
3. Copy the "Token Address" from the token page

**Option 2: Jupiter Token List**

- Browse verified tokens at [station.jup.ag/docs/token-list](https://station.jup.ag/docs/token-list)

#### Common Token Mints

| Token         | Mint Address                                   |
| ------------- | ---------------------------------------------- |
| SOL (wrapped) | `So11111111111111111111111111111111111111112`  |
| USDC          | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` |
| USDT          | `Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB` |
| RAY           | `4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R` |
| BONK          | `DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263` |

#### wSOL vs Native SOL

- **wSOL (wrapped SOL)**: Mint address shown above, required for Jupiter swaps
- **Native SOL**: Automatically wrapped/unwrapped by Jupiter Plugin
- Users can swap using native SOL directly - wrapping happens behind the scenes

### Changing Networks

For devnet/testnet:

```env
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_NETWORK=devnet
```

**Important:** Use devnet token mints when on devnet. Mainnet addresses won't work on devnet.

## Project Structure

```
gill-jupiter-swap/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx             # Main page
│   │   └── globals.css          # Global styles
│   └── components/
│       ├── AppContent.tsx       # Main app component
│       ├── JupiterPlugin.tsx    # Jupiter Plugin integration ⭐
│       └── WalletContextProvider.tsx  # Wallet setup
├── types/
│   └── jupiter.d.ts             # Jupiter Plugin type declarations
├── .env.example                 # Environment template
├── package.json
└── README.md
```

## Advanced Usage

### Customizing Jupiter Plugin

Edit `src/components/JupiterPlugin.tsx` to customize Jupiter behavior:

```typescript
window.Jupiter.init({
  displayMode: "integrated", // or 'modal', 'widget'
  strictTokenList: true, // Only show verified tokens
  defaultExplorer: "Solscan", // or 'Solana Explorer'
  formProps: {
    initialAmount: "1000000", // Default amount in base units
  },
  // ... more options
});
```

### Handling Swap Events

Add custom logic after successful swaps:

```typescript
onSuccess: (txid: string) => {
  console.log('Swap completed!', txid);
  // Add your custom logic here
  // - Update UI
  // - Track analytics
  // - Show notifications
},
```

## API Documentation

### Jupiter Plugin

- **Docs**: [station.jup.ag/docs/apis/swap-api](https://station.jup.ag/docs/apis/swap-api)
- **GitHub**: [github.com/jup-ag/terminal](https://github.com/jup-ag/terminal)

### Jupiter V6 Swap API

- **API Reference**: [station.jup.ag/api-v6](https://station.jup.ag/api-v6)
- **Integration Guide**: [station.jup.ag/docs/apis/swap-api](https://station.jup.ag/docs/apis/swap-api)

### Gill (Solana RPC)

- **GitHub**: [github.com/solana-developers/solana-rpc-get-started](https://github.com/solana-developers/solana-rpc-get-started)
- **Docs**: Lightweight Solana wallet adapter

## Troubleshooting

### Plugin Not Loading

```
❌ Failed to load Jupiter Plugin script
```

**Solution:** Check your internet connection and ensure `terminal.jup.ag` is accessible.

### Wallet Not Connecting

```
⚠️ Wallet adapter not found
```

**Solution:** Ensure you have a compatible Solana wallet browser extension installed.

### Wrong Network

```
❌ Transaction failed - wrong cluster
```

**Solution:** Verify your `NEXT_PUBLIC_SOLANA_RPC_URL` matches your wallet's network setting.

### Referral Not Working

```
💰 Referral fees not showing
```

**Solution:**

1. Ensure `NEXT_PUBLIC_JUP_REFERRAL_ACCOUNT` is a valid Solana address
2. Check `NEXT_PUBLIC_JUP_REFERRAL_BPS` is between 1-100
3. Referral fees appear after swap completion

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Other Platforms

This is a standard Next.js app and works on:

- Vercel
- Netlify
- Railway
- Self-hosted Node.js

**Remember:** Set all environment variables in your hosting platform's dashboard.

## Contributing

Found a bug or want to improve the template?

1. Fork the [templates repo](https://github.com/solana-foundation/templates)
2. Create your branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

MIT License - feel free to use this template for your projects!

## Support

- **Jupiter Discord**: [discord.gg/jup](https://discord.gg/jup)
- **Solana Stack Exchange**: [solana.stackexchange.com](https://solana.stackexchange.com)
- **Template Issues**: [github.com/solana-foundation/templates/issues](https://github.com/solana-foundation/templates/issues)

---

**Built with ❤️ by the Solana community**
