# JupAgg - Solana Token Swap Aggregator

A modern Next.js application for swapping Solana tokens using Jupiter's routing engine with an intuitive interface and comprehensive token support.

## ✨ Features

- 🔄 **Jupiter Integration** - Best-in-class swap routing with optimal price discovery
- 🪙 **20+ Popular Tokens** - SOL, USDC, USDT, BONK, WIF, JUP, mSOL, and more
- 🎨 **Modern UI** - Clean, responsive interface with glassmorphism design
- 🔐 **Wallet Integration** - Seamless connection with Phantom, Solflare, and other Solana wallets
- ⚡ **Real-time Quotes** - Live price updates and route optimization
- 🛡️ **Slippage Control** - Customizable slippage tolerance
- 📊 **Route Visualization** - See swap paths and price impact
- 🌐 **Mainnet Ready** - Production-ready with Helius RPC integration

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Solana Wallet** - [Phantom](https://phantom.app/) or [Solflare](https://solflare.com/)
- **Git** - For cloning the repository

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd jupagg
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create environment file
   cp .env.example .env.local
   ```

4. **Configure your environment**
   Create a `.env.local` file in the root directory:
   ```env
   # Solana RPC endpoint (replace with your preferred RPC)
   NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
   
   # Optional: Jupiter API key for higher rate limits
   NEXT_PUBLIC_JUPITER_API_KEY=your_jupiter_api_key_here
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Testing
npm test             # Run tests (if available)
```

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── jupiter/       # Jupiter API proxies
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/            # React components
│   ├── SwapInterface.tsx  # Main swap interface
│   ├── TokenSelector.tsx  # Token selection modal
│   ├── SlippageControl.tsx # Slippage settings
│   ├── RouteVisualization.tsx # Route details
│   └── WalletContextProvider.tsx # Wallet setup
├── services/              # Business logic
│   └── gill-jupiter.ts   # Jupiter service integration
└── types/                 # TypeScript definitions
    └── index.ts
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Required: Solana RPC endpoint
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# Optional: Jupiter API key for higher rate limits
NEXT_PUBLIC_JUPITER_API_KEY=your_jupiter_api_key_here

# Optional: Default tokens (SOL and USDC)
NEXT_PUBLIC_DEFAULT_INPUT_MINT=So11111111111111111111111111111111111111112
NEXT_PUBLIC_DEFAULT_OUTPUT_MINT=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
```

### RPC Endpoints

**Recommended:**
- **Helius** - `https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY`
- **QuickNode** - `https://your-endpoint.solana-mainnet.quiknode.pro/YOUR_API_KEY/`

**Free Options:**
- **Solana Foundation** - `https://api.mainnet-beta.solana.com`
- **Alchemy** - `https://solana-mainnet.g.alchemy.com/v2/YOUR_API_KEY`

## 🪙 Supported Tokens

The application supports 20+ popular Solana tokens:

### Major Tokens
- **SOL** - Solana (native)
- **USDC** - USD Coin
- **USDT** - Tether USD

### DeFi Tokens
- **RAY** - Raydium
- **ORCA** - Orca
- **JUP** - Jupiter
- **mSOL** - Marinade Staked SOL
- **MNGO** - Mango

### Meme Coins
- **BONK** - Bonk
- **WIF** - dogwifhat
- **POPCAT** - Popcat
- **BOME** - BOOK OF MEME

### Cross-chain Assets
- **WETH** - Wrapped Ether
- **WBTC** - Wrapped Bitcoin

## 🚀 Deployment

### Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Set environment variables**
   - Go to Vercel dashboard
   - Navigate to your project
   - Add environment variables in Settings

### Other Platforms

This Next.js app works on:
- **Netlify** - Automatic deployments from Git
- **Railway** - Simple deployment with environment variables
- **Self-hosted** - Any Node.js hosting platform

## 🐛 Troubleshooting

### Common Issues

**Wallet Not Connecting**
```
⚠️ Wallet adapter not found
```
**Solution:** Install a Solana wallet browser extension (Phantom, Solflare, etc.)

**RPC Errors**
```
❌ RPC endpoint not responding
```
**Solution:** Check your RPC endpoint in `.env.local` and ensure it's valid

**Build Errors**
```
❌ Module not found
```
**Solution:** Run `npm install` to install all dependencies

**Swap Failures**
```
❌ Transaction failed
```
**Solutions:**
- Ensure you have sufficient SOL for transaction fees
- Check that you have enough of the input token
- Try increasing slippage tolerance
- Verify you're connected to Solana Mainnet

### Debug Mode

Enable detailed logging by opening browser DevTools:
1. Press `F12` to open DevTools
2. Go to Console tab
3. Look for Jupiter API logs and error messages

## 📚 API Reference

### Jupiter API Integration

The app uses Jupiter's v1 lite API for optimal performance:

- **Quote Endpoint:** `https://lite-api.jup.ag/swap/v1/quote`
- **Swap Endpoint:** `https://lite-api.jup.ag/swap/v1/swap`

### Supported Parameters

- **inputMint** - Source token mint address
- **outputMint** - Destination token mint address  
- **amount** - Amount in smallest token unit (lamports)
- **slippageBps** - Slippage tolerance in basis points (50 = 0.5%)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Jupiter** - For the amazing swap routing engine
- **Solana Foundation** - For the robust blockchain infrastructure
- **Gill** - For the wallet integration framework
- **Next.js Team** - For the excellent React framework

## 📞 Support

- **Jupiter Discord:** [discord.gg/jup](https://discord.gg/jup)
- **Solana Stack Exchange:** [solana.stackexchange.com](https://solana.stackexchange.com)
- **GitHub Issues:** [Create an issue](https://github.com/your-repo/issues)

---

**Built with ❤️ for the Solana community**

*Happy swapping! 🚀*
