# Recipe: Multi-Denomination Wallet with Minting & Governance

## Description
A service-credit / internal-coin backend: multi-denomination balances, an append-only ledger,
controlled minting with a supply cap, maker-checker approvals, and an embeddable balance widget.

## Atoms Used
1. `modules/multi-denom-wallet-balance` — balances per denomination + fiat total
2. `modules/wallet-denomination-ledger` + `modules/double-entry-ledger` — append-only, reconciliation-proof
3. `modules/batch-mint-issuance-authority` + `modules/token-supply-cap-accounting` — capped minting
4. `modules/admin-approval-maker-checker` — four-eyes approval for high-value ops
5. `modules/token-burn-redemption-audit` — immutable burn trail
6. `tools/embeddable-balance-widget-sdk` — drop-in partner balance widget

## Execution Order
mint (batch-mint + supply-cap + maker-checker) -> double-entry ledger -> multi-denom balance; redeem/burn -> burn-audit -> ledger; display -> widget

## Final Output
An auditable credit/coin system with capped issuance, governed approvals, and a partner-embeddable balance view.

*Open source — use it wisely.*