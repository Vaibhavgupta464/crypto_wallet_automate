import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UNISWAP_V2_ROUTER_ABI = [
    'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)',
    'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)',
    'function WETH() external pure returns (address)'
];

const ERC20_ABI = [
    'function balanceOf(address owner) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function symbol() view returns (string)',
    'function name() view returns (string)'
];

async function buyTokens() {
    console.log('🛒 Starting token purchase from 100 wallets...\n');
    
    const rpcUrl = process.env.SEPOLIA_RPC_URL;
    const routerAddress = process.env.ROUTER_ADDRESS;
    const tokenAddress = process.env.TOKEN_ADDRESS;
    const ethAmountForPurchase = process.env.ETH_AMOUNT_FOR_TOKEN_PURCHASE || '0.005';
    const slippageTolerance = parseInt(process.env.SLIPPAGE_TOLERANCE || '5');
    
    if (!rpcUrl) {
        throw new Error('SEPOLIA_RPC_URL not set in .env file');
    }
    
    if (!routerAddress) {
        throw new Error('ROUTER_ADDRESS not set in .env file');
    }
    
    if (!tokenAddress) {
        throw new Error('TOKEN_ADDRESS not set in .env file');
    }
    
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const router = new ethers.Contract(routerAddress, UNISWAP_V2_ROUTER_ABI, provider);
    const token = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    
    console.log('📋 Configuration:');
    console.log(`   - Router: ${routerAddress}`);
    console.log(`   - Token: ${tokenAddress}`);
    console.log(`   - ETH per purchase: ${ethAmountForPurchase} ETH`);
    console.log(`   - Slippage tolerance: ${slippageTolerance}%\n`);
    
    try {
        const tokenName = await token.name();
        const tokenSymbol = await token.symbol();
        const tokenDecimals = await token.decimals();
        console.log(`🪙 Token Info: ${tokenName} (${tokenSymbol}), Decimals: ${tokenDecimals}\n`);
    } catch (error) {
        console.log('⚠️  Could not fetch token info (might not be deployed yet)\n');
    }
    
    const walletsFile = path.join(__dirname, '..', 'output', 'wallets.json');
    if (!fs.existsSync(walletsFile)) {
        throw new Error('wallets.json not found! Run generateWallets.js first.');
    }
    
    const wallets = JSON.parse(fs.readFileSync(walletsFile, 'utf8'));
    
    const wethAddress = await router.WETH();
    console.log(`💧 WETH address: ${wethAddress}\n`);
    
    const results = [];
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < wallets.length; i++) {
        const walletData = wallets[i];
        const wallet = new ethers.Wallet(walletData.privateKey, provider);
        
        try {
            console.log(`[${i + 1}/100] Wallet ${walletData.index}: ${wallet.address}`);
            
            const balance = await provider.getBalance(wallet.address);
            const balanceInEth = ethers.formatEther(balance);
            console.log(`   💰 Balance: ${balanceInEth} ETH`);
            
            if (parseFloat(balanceInEth) < parseFloat(ethAmountForPurchase)) {
                throw new Error(`Insufficient balance. Has ${balanceInEth} ETH, needs ${ethAmountForPurchase} ETH`);
            }
            
            const amountIn = ethers.parseEther(ethAmountForPurchase);
            const path = [wethAddress, tokenAddress];
            
            console.log(`   📊 Getting quote...`);
            const amounts = await router.getAmountsOut(amountIn, path);
            const expectedTokens = amounts[1];
            
            const minTokens = (expectedTokens * BigInt(100 - slippageTolerance)) / BigInt(100);
            
            console.log(`   💱 Expected tokens: ${ethers.formatUnits(expectedTokens, 18)}`);
            console.log(`   💱 Min tokens (with ${slippageTolerance}% slippage): ${ethers.formatUnits(minTokens, 18)}`);
            
            const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
            
            const routerWithSigner = router.connect(wallet);
            
            console.log(`   🔄 Executing swap...`);
            const tx = await routerWithSigner.swapExactETHForTokens(
                minTokens,
                path,
                wallet.address,
                deadline,
                { value: amountIn }
            );
            
            console.log(`   ⏳ Transaction hash: ${tx.hash}`);
            const receipt = await tx.wait();
            
            console.log(`   ✅ Confirmed in block ${receipt.blockNumber}`);
            
            const tokenBalance = await token.balanceOf(wallet.address);
            console.log(`   🪙 Token balance: ${ethers.formatUnits(tokenBalance, 18)}\n`);
            
            results.push({
                index: walletData.index,
                address: wallet.address,
                ethSpent: ethAmountForPurchase,
                tokensReceived: ethers.formatUnits(tokenBalance, 18),
                txHash: tx.hash,
                blockNumber: receipt.blockNumber,
                status: 'success'
            });
            
            successCount++;
            
            if (i < wallets.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            
        } catch (error) {
            console.error(`   ❌ Failed: ${error.message}\n`);
            results.push({
                index: walletData.index,
                address: wallet.address,
                error: error.message,
                status: 'failed'
            });
            failCount++;
        }
    }
    
    const resultsFile = path.join(__dirname, '..', 'output', 'token-purchase-results.json');
    fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 TOKEN PURCHASE COMPLETE');
    console.log('='.repeat(60));
    console.log(`✅ Successful: ${successCount}/100`);
    console.log(`❌ Failed: ${failCount}/100`);
    console.log(`📁 Results saved to: ${resultsFile}`);
    console.log('='.repeat(60) + '\n');
    
    return results;
}

if (import.meta.url === `file://${process.argv[1]}`) {
    buyTokens().catch(console.error);
}

export default buyTokens;
