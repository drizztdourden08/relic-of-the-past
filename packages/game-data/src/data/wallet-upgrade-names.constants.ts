/* @layer shared-game @kind constants */
const WALLET_LADDER_STEPS = 100;
const WALLET_STEP_RUPEES = 100;

const WALLET_UPGRADE_NAMES: readonly string[] =
  Array.from({ length: WALLET_LADDER_STEPS }, (_, index) => `Wallet Upgrade (+${(index + 1) * WALLET_STEP_RUPEES})`);

export { WALLET_UPGRADE_NAMES };
