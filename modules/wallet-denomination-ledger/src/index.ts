type TransactionType = 'TRANSFER_IN' | 'TRANSFER_OUT' | 'MINT' | 'BURN' | 'HOLD' | 'SETTLE';

interface LedgerEntry {
  txId: string;
  walletId: string;
  denom: Denomination;
  type: TransactionType;
  amount: number;
  balance: number;  // Running balance after this tx
  note?: string;
  timestamp: ISO8601;
}

async function postLedger(
  walletId: string,
  denom: Denomination,
  type: TransactionType,
  amount: number,
  note?: string
): Promise<LedgerEntry>;

async function getLedgerEntries(
  walletId: string,
  denom?: Denomination,
  limit?: number
): Promise<LedgerEntry[]>;

async function getBalance(
  walletId: string,
  denom: Denomination
): Promise<number>;  // Sum all entries for denom