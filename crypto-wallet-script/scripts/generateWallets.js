import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateWallets() {
    console.log('🔑 Generating 100 wallets...\n');
    
    const wallets = [];
    
    for (let i = 0; i < 100; i++) {
        const wallet = ethers.Wallet.createRandom();
        wallets.push({
            index: i + 1,
            address: wallet.address,
            privateKey: wallet.privateKey,
            mnemonic: wallet.mnemonic.phrase
        });
        
        if ((i + 1) % 10 === 0) {
            console.log(`✅ Generated ${i + 1} wallets...`);
        }
    }
    
    const outputDir = path.join(__dirname, '..', 'output');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const walletsFile = path.join(outputDir, 'wallets.json');
    fs.writeFileSync(walletsFile, JSON.stringify(wallets, null, 2));
    
    const addressesFile = path.join(outputDir, 'addresses.txt');
    const addressesList = wallets.map(w => `${w.index}. ${w.address}`).join('\n');
    fs.writeFileSync(addressesFile, addressesList);
    
    console.log('\n✅ Successfully generated 100 wallets!');
    console.log(`📁 Wallets saved to: ${walletsFile}`);
    console.log(`📁 Addresses saved to: ${addressesFile}`);
    console.log('\n⚠️  IMPORTANT: Keep wallets.json secure! It contains private keys.');
    
    return wallets;
}

if (import.meta.url === `file://${process.argv[1]}`) {
    generateWallets().catch(console.error);
}

export default generateWallets;
