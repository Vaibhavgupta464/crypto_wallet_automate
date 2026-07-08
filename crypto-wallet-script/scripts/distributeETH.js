import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function distributeETH() {
    console.log('💸 Starting ETH distribution to 100 wallets...\n');
    
    const mainPrivateKey = process.env.MAIN_WALLET_PRIVATE_KEY;
    const rpcUrl = process.env.SEPOLIA_RPC_URL;
    const ethAmount = process.env.ETH_AMOUNT_PER_WALLET || '0.01';
    
    if (!mainPrivateKey) {
        throw new Error('MAIN_WALLET_PRIVATE_KEY not set in .env file');
    }
    
    if (!rpcUrl) {
        throw new Error('SEPOLIA_RPC_URL not set in .env file');
    }
    
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const mainWallet = new ethers.Wallet(mainPrivateKey, provider);
    
    console.log(`📍 Main wallet address: ${mainWallet.address}`);
    
    const balance = await provider.getBalance(mainWallet.address);
    const balanceInEth = ethers.formatEther(balance);
    console.log(`💰 Main wallet balance: ${balanceInEth} ETH\n`);
    
    const totalRequired = parseFloat(ethAmount) * 100;
    const estimatedGas = 0.002 * 100;
    const totalWithGas = totalRequired + estimatedGas;
    
    console.log(`📊 Distribution summary:`);
    console.log(`   - Amount per wallet: ${ethAmount} ETH`);
    console.log(`   - Total wallets: 100`);
    console.log(`   - Total ETH needed: ${totalRequired} ETH`);
    console.log(`   - Estimated gas: ~${estimatedGas.toFixed(4)} ETH`);
    console.log(`   - Total required: ~${totalWithGas.toFixed(4)} ETH\n`);
    
    if (parseFloat(balanceInEth) < totalWithGas) {
        throw new Error(`Insufficient balance! Need at least ${totalWithGas.toFixed(4)} ETH`);
    }
    
    const walletsFile = path.join(__dirname, '..', 'output', 'wallets.json');
    if (!fs.existsSync(walletsFile)) {
        throw new Error('wallets.json not found! Run generateWallets.js first.');
    }
    
    const wallets = JSON.parse(fs.readFileSync(walletsFile, 'utf8'));
    
    const results = [];
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < wallets.length; i++) {
        const wallet = wallets[i];
        try {
            console.log(`[${i + 1}/100] Sending ${ethAmount} ETH to ${wallet.address}...`);
            
            const tx = await mainWallet.sendTransaction({
                to: wallet.address,
                value: ethers.parseEther(ethAmount)
            });
            
            console.log(`   ⏳ Transaction hash: ${tx.hash}`);
            const receipt = await tx.wait();
            
            console.log(`   ✅ Confirmed in block ${receipt.blockNumber}\n`);
            
            results.push({
                index: wallet.index,
                address: wallet.address,
                amount: ethAmount,
                txHash: tx.hash,
                blockNumber: receipt.blockNumber,
                status: 'success'
            });
            
            successCount++;
            
            if (i < wallets.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
        } catch (error) {
            console.error(`   ❌ Failed: ${error.message}\n`);
            results.push({
                index: wallet.index,
                address: wallet.address,
                amount: ethAmount,
                error: error.message,
                status: 'failed'
            });
            failCount++;
        }
    }
    
    const resultsFile = path.join(__dirname, '..', 'output', 'distribution-results.json');
    fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 DISTRIBUTION COMPLETE');
    console.log('='.repeat(60));
    console.log(`✅ Successful: ${successCount}/100`);
    console.log(`❌ Failed: ${failCount}/100`);
    console.log(`📁 Results saved to: ${resultsFile}`);
    console.log('='.repeat(60) + '\n');
    
    return results;
}

if (import.meta.url === `file://${process.argv[1]}`) {
    distributeETH().catch(console.error);
}

export default distributeETH;
