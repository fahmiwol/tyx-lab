// Example: Midtrans webhook for order completion
async function handleMidtransNotification(payload: MidtransPayload) {
  const idempotencyKey = `midtrans_${payload.order_id}_${payload.transaction_id}`;

  // Check if we already processed this
  const existing = await db.transaction.findFirst({
    where: {
      payload: { idempotencyKey }  // Stored in JSON column
    }
  });

  if (existing) {
    // Already processed: return cached result (idempotent)
    return { success: true, txId: existing.id };
  }

  // First time: process mutation wrapped in transaction
  return db.$transaction(async (tx) => {
    // ... credit user ...
    const txRecord = await tx.transaction.create({
      data: {
        type: "TOPUP",
        toWalletId: userId,
        amount: BigInt(payload.gross_amount),
        payload: {
          orderId: payload.order_id,
          midtransId: payload.transaction_id,
          idempotencyKey,
          status: payload.transaction_status
        }
      }
    });

    return { success: true, txId: txRecord.id };
  });
}