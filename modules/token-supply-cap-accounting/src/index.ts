import { BigInt as BN } from "bigint";

type Denomination = "GOLD" | "SILVER" | "BRONZE" | "DIAMOND";

export interface SupplyStatus {
  denomination: Denomination;
  maxSupply: bigint | null;
  minted: bigint;
  burned: bigint;
  circulating: bigint;
  remainingMintable: bigint | null;
  capEnforced: boolean;
}

const DEFAULT_LIMITS: Record<Denomination, bigint | null> = {
  GOLD: 1000000n,
  SILVER: 5000000n,
  BRONZE: null,
  DIAMOND: null,
};

export async function getSupplyStatus(denomination: Denomination): Promise<SupplyStatus> {
  const maxSupply = DEFAULT_LIMITS[denomination];
  const circulating = 0n;
  const remainingMintable = maxSupply ? maxSupply : null;
  return { denomination, maxSupply, minted: 0n, burned: 0n, circulating, remainingMintable, capEnforced: maxSupply !== null };
}

export async function validateMintCapacity(denomination: Denomination, amount: bigint): Promise<{ allowed: boolean; reason?: string }> {
  const status = await getSupplyStatus(denomination);
  if (!status.capEnforced) return { allowed: true };
  if (status.remainingMintable && status.remainingMintable < amount) {
    return { allowed: false, reason: `Remaining: ${status.remainingMintable}` };
  }
  return { allowed: true };
}
