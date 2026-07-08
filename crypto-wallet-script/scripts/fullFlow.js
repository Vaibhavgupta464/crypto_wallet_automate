import generateWallets from './generateWallets.js';
import distributeETH from './distributeETH.js';
import buyTokens from './buyTokens.js';

async function fullFlow() {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 STARTING FULL WORKFLOW');
    console.log('='.repeat(60) + '\n');
    
    try {
        console.log('STEP 1: Generate 100 wallets');
        console.log('-'.repeat(60));
        await generateWallets();
        console.log('\n');
        
        console.log('STEP 2: Distribute ETH to all wallets');
        console.log('-'.repeat(60));
        await distributeETH();
        console.log('\n');
        
        console.log('STEP 3: Buy tokens from all wallets');
        console.log('-'.repeat(60));
        await buyTokens();
        console.log('\n');
        
        console.log('='.repeat(60));
        console.log('✅ FULL WORKFLOW COMPLETED SUCCESSFULLY!');
        console.log('='.repeat(60) + '\n');
        
    } catch (error) {
        console.error('\n' + '='.repeat(60));
        console.error('❌ WORKFLOW FAILED');
        console.error('='.repeat(60));
        console.error(`Error: ${error.message}`);
        console.error('='.repeat(60) + '\n');
        throw error;
    }
}

fullFlow().catch(console.error);
