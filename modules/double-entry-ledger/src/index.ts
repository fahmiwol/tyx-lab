// CONVERSION_RULES: configurable matrix
const CONVERSION_RULES = {
  "GOLD->SILVER": { ratio: 1, allowed: true },
  "SILVER->BRONZE": { ratio: 1, allowed: true, fee: 3000 }  // IDR margin
};

async function convertCoins(userId: string, fromDenom: string, toDenom: string, amount: number) {
  const rule = CONVERSION_RULES[`${fromDenom}->${toDenom}`];
  if (!rule?.allowed) throw new Error("Conversion not allowed");

  const received = amount * rule.ratio;  // e.g., 1:1
  const feeIdr = rule.fee || 0;

  return prisma.$transaction(async (tx) => {
    // Debit sender
    await tx.walletBalance.update({
      where: { walletId_denomination: { walletId, denomination: fromDenom } },
      data: { amount: { decrement: BigInt(amount) } }
    });

    // Credit receiver (less margin)
    await tx.walletBalance.update({
      where: { walletId_denomination: { walletId, denomination: toDenom } },
      data: { amount: { increment: BigInt(received) } }
    });

    // Ledger
    await tx.transaction.create({
      data: {
        type: "CONVERT",
        status: "COMPLETED",
        fromWalletId: walletId,
        toWalletId: walletId,
        fromDenom,
        toDenom,
        amount: BigInt(amount),
        fee: BigInt(feeIdr),
        note: `Conversion ${amount} ${fromDenom} → ${received} ${toDenom}, margin: IDR${feeIdr}`
      }
    });
  });
}