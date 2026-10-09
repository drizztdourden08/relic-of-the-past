/* @layer shared-features @kind logic */
import type { GameSettings } from '@shared/types/settings';

const isDeluxeMode = (mode: GameSettings['enableMSU']): boolean =>
  mode === 'deluxe' || mode === 'deluxe-opuz';

export { isDeluxeMode };
