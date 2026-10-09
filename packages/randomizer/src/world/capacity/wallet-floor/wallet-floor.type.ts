/* @layer shared-game @kind types */

interface WalletDemand {
  need: number;
  label: string;
}

interface WalletFloor {
  need: number;
  label: string;
  rung: number;
  top: number;
  reason: string;
}

export type { WalletDemand, WalletFloor };
