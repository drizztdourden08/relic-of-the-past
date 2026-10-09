/* @layer renderer-components @kind logic */
import { SNES_ICON_MAP } from './button-icon-paths';
import { getButtonIconUrl } from './get-button-icon-url';

const getSnesIconUrl = (snesButton: string): string | null => {
  const iconId = SNES_ICON_MAP[snesButton];
  return iconId ? getButtonIconUrl(iconId) : null;
};

export { getSnesIconUrl };
