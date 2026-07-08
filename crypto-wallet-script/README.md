# Crypto Wallet Script - Multi-Wallet Token Purchase

Automated script to create 100 ERC20 wallets, distribute Sepolia ETH, and purchase tokens using a DEX router.

## 📋 Features

- ✅ Generate 100 random Ethereum wallets
- ✅ Distribute 0.01 Sepolia ETH from main wallet to all 100 wallets
- ✅ Buy ABC tokens from all 100 wallets using Uniswap-style router
- ✅ Automatic slippage protection
- ✅ Detailed transaction logging and results

## 🚀 Quick Start

### Prerequisites

- Node.js v18+ installed
- A main wallet with sufficient Sepolia ETH (~2+ ETH recommended)
- Sepolia RPC URL (from Infura, Alchemy, or public RPC)
- DEX Router address (e.g., Uniswap V2 Router on Sepolia)
- Token contract address (ABC token)

### Installation

1. Navigate to the project directory:
```bash
cd crypto-wallet-script
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from example:
```bash
cp .env.example .env
```

4. Edit `.env` file with your configuration:
```env
MAIN_WALLET_PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
TOKEN_ADDRESS=0x...
ROUTER_ADDRESS=0x...
ETH_AMOUNT_PER_WALLET=0.01
ETH_AMOUNT_FOR_TOKEN_PURCHASE=0.005
SLIPPAGE_TOLERANCE=5
```

## 📖 Usage

### Option 1: Run Full Workflow (Recommended)

Execute all steps automatically:
```bash
npm run full-flow
```

This will:
1. Generate 100 wallets
2. Distribute ETH to all wallets
3. Buy tokens from all wallets

### Option 2: Run Individual Steps

**Step 1: Generate Wallets**
```bash
npm run generate-wallets
```
Creates 100 random wallets and saves to `output/wallets.json`

**Step 2: Distribute ETH**
```bash
npm run distribute-eth
```
Sends 0.01 ETH from main wallet to all 100 wallets

**Step 3: Buy Tokens**
```bash
npm run buy-tokens
```
Uses each wallet to buy ABC tokens via DEX router

## 📁 Output Files

All output files are saved in the `output/` directory:

- `wallets.json` - Complete wallet data (addresses, private keys, mnemonics)
- `addresses.txt` - Simple list of wallet addresses
- `distribution-results.json` - ETH distribution transaction results
- `token-purchase-results.json` - Token purchase transaction results

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MAIN_WALLET_PRIVATE_KEY` | Private key of wallet with Sepolia ETH | Required |
| `SEPOLIA_RPC_URL` | Sepolia network RPC endpoint | Required |
| `TOKEN_ADDRESS` | ABC token contract address | Required |
| `ROUTER_ADDRESS` | DEX router contract address | Required |
| `ETH_AMOUNT_PER_WALLET` | ETH to send to each wallet | 0.01 |
| `ETH_AMOUNT_FOR_TOKEN_PURCHASE` | ETH to use for buying tokens | 0.005 |
| `SLIPPAGE_TOLERANCE` | Slippage tolerance percentage | 5 |

### Finding Router Addresses

**Uniswap V2 Router on Sepolia:**
- Address: `0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D` (if deployed)
- Check [Uniswap docs](https://docs.uniswap.org/contracts/v2/reference/smart-contracts/router-02) for latest addresses

**Alternative DEX Routers:**
- SushiSwap Router
- PancakeSwap Router (if available on Sepolia)
- Custom DEX implementations

## 🔒 Security

⚠️ **IMPORTANT SECURITY NOTES:**

1. **Never commit `.env` file** - Contains your private key
2. **Keep `wallets.json` secure** - Contains 100 private keys
3. **Use testnet only** - This script is for Sepolia testnet
4. **Backup your keys** - Store wallets.json in a secure location
5. **Test with small amounts first** - Verify everything works before scaling

## 💡 How It Works

### 1. Wallet Generation
- Uses `ethers.Wallet.createRandom()` to generate secure wallets
- Each wallet has a unique private key and mnemonic phrase
- Wallets are saved with index, address, private key, and mnemonic

### 2. ETH Distribution
- Connects to Sepolia network via RPC
- Sends transactions from main wallet to each of 100 wallets
- Includes 1-second delay between transactions to avoid nonce issues
- Tracks success/failure for each transaction

### 3. Token Purchase
- Connects each wallet to the DEX router
- Gets WETH address from router
- Calculates expected token output using `getAmountsOut`
- Applies slippage tolerance to set minimum tokens
- Executes `swapExactETHForTokens` for each wallet
- Includes 2-second delay between swaps

## 🛠️ Troubleshooting

### "Insufficient balance" error
- Ensure main wallet has enough Sepolia ETH
- Required: (0.01 ETH × 100) + gas fees ≈ 1.2+ ETH

### "Transaction underpriced" error
- Network congestion - increase gas price
- Wait and retry

### "Execution reverted" on token swap
- Check token has liquidity on the DEX
- Verify router and token addresses are correct
- Increase slippage tolerance if needed

### "Cannot find wallets.json"
- Run `npm run generate-wallets` first
- Check `output/` directory exists

## 📊 Expected Costs (Sepolia)

- **ETH Distribution:** 100 × 0.01 ETH = 1 ETH
- **Gas for distribution:** ~0.002 ETH per tx × 100 = 0.2 ETH
- **ETH for token purchases:** 100 × 0.005 ETH = 0.5 ETH
- **Gas for swaps:** ~0.003 ETH per tx × 100 = 0.3 ETH
- **Total:** ~2+ ETH recommended

## 🔗 Useful Links

- [Sepolia Faucet](https://sepoliafaucet.com/) - Get free Sepolia ETH
- [Etherscan Sepolia](https://sepolia.etherscan.io/) - View transactions
- [Infura](https://infura.io/) - RPC provider
- [Alchemy](https://www.alchemy.com/) - Alternative RPC provider

## 📝 License

MIT License - Use at your own risk

## ⚠️ Disclaimer

This script is for educational and testing purposes only. Use on testnet (Sepolia) only. Never use on mainnet without thorough testing and security audits. The authors are not responsible for any loss of funds.
