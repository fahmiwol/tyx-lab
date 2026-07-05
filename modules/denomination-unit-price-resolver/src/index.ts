type Denomination = 'GOLD' | 'SILVER' | 'BRONZE' | 'DIAMOND';

async function getPriceForDenom(
  denom: Denomination,
  atTimestamp?: ISO8601
): Promise<{ denom, idr, effectiveAt, nextChange }>;

// Or batch:
async function getPrices(
  denoms: Denomination[],
  atTimestamp?: ISO8601
): Promise<Record<Denomination, number>>;