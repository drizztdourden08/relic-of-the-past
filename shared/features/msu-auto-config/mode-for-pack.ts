/* @layer shared-features @kind logic */
import type { GameSettings } from '@shared/types/settings';
import type { MsuPackProfile } from './msu-auto-config.type';

const modeForPack = (pack: MsuPackProfile): GameSettings['enableMSU'] => {
  if (pack.isLayered) return 'msul';
  if (pack.isDeluxe && pack.hasOpuz) return 'deluxe-opuz';
  if (pack.isDeluxe) return 'deluxe';
  if (pack.hasOpuz) return 'opuz';
  return 'true';
};

export { modeForPack };
