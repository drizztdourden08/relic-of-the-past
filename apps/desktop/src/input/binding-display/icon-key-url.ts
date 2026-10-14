/* @layer renderer-lib @kind logic */
import type { ButtonIcon } from '@rotp/game-data';
import { getButtonIconUrl } from '@app/input/button-icons/get-button-icon-url';

const iconKeyUrl = (icon: ButtonIcon | null | undefined): string | null =>
  icon?.key ? getButtonIconUrl(icon.key) : null;

export { iconKeyUrl };
