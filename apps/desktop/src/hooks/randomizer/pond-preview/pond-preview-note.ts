/* @layer renderer-hooks @kind logic */
import type { PondSetting } from '@shared/randomizer/world/pond/pond-profile.type';
import type { PondCharge } from './pond-preview.type';

const itemsText = (count: number): string => `${count} pool item${count === 1 ? '' : 's'}`;

const pondPreviewNote = (
  setting: PondSetting, prizeCount: number, charges: readonly PondCharge[],
): string => {
  if (setting.mode === 'capacity') return 'the native purchase loop';
  const prizes = itemsText(prizeCount);
  if (charges.length === 0) return `${prizes}, handed over for nothing`;
  const rupees = charges.reduce((sum, charge) => sum + charge.rupees, 0);
  const others = charges.filter((charge) => charge.other).length;
  if (others === 0) return `${prizes} · ${rupees} rupees to empty`;
  const asks = `${others} other demand${others === 1 ? '' : 's'}`;
  return rupees === 0 ? `${prizes} · ${asks} to empty` : `${prizes} · ${rupees} rupees and ${asks} to empty`;
};

export { pondPreviewNote };
