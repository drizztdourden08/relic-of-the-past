/* @layer bridge-wasm @kind logic */
import { walletTableSlot } from './wallet-table-slot';

const sessionWalletTable = (): readonly number[] => walletTableSlot.rungsBySlot;

export { sessionWalletTable };
