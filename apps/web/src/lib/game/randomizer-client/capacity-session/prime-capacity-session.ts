/* @layer bridge-wasm @kind logic */
import { setSessionWalletTable } from '../session-wallet-table';
import type { CapacitySessionPlan } from './capacity-session.type';

const primeCapacitySession = (plan: CapacitySessionPlan): void => {
  setSessionWalletTable(plan.walletTable);
};

export { primeCapacitySession };
