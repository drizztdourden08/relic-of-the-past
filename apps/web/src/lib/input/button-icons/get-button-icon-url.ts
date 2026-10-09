/* @layer renderer-components @kind logic */
import { BUTTON_ICON_MAP } from './button-icons.constants';

const getButtonIconUrl = (iconId: string): string | null => BUTTON_ICON_MAP[iconId] ?? null;

export { getButtonIconUrl };
