const wallet = await getWalletBalance('wallet_abc123');
// { walletId: 'wallet_abc123', balances: { GOLD: 5, SILVER: 120, ... }, totalIDR: 1010000 }

// Use for display:
console.log(`Saldo SILVER: ${wallet.balances.SILVER} koin (~Rp ${wallet.balances.SILVER * 8000})`);

// Use for settlement pre-check:
if (wallet.balances.SILVER < amountNeeded) throw new Error('Insufficient balance');