/* @layer shared-game @kind logic */
import type { CapacityProfile } from '../capacity-profile.type';
import type { WalletFloor } from './wallet-floor.type';

const holdWalletToFloor = (profile: CapacityProfile, floor: WalletFloor): CapacityProfile => {
  const { wallet } = profile;
  if (wallet.mode !== 'custom' || wallet.max >= floor.top) return profile;
  return { ...profile, wallet: { ...wallet, max: floor.top } };
};

export { holdWalletToFloor };
