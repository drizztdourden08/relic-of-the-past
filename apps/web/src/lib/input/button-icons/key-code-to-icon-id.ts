/* @layer renderer-components @kind logic */
import { KEY_CODE_ICON_IDS } from './button-icon-paths';

const keyCodeToIconId = (code: string): string | null => {
  if (code.startsWith('Key')) return `kb-${code.slice(3).toLowerCase()}`;
  if (code.startsWith('Digit')) return `kb-${code.slice(5)}`;
  if (code.startsWith('F') && /^F\d+$/.test(code)) return `kb-${code.toLowerCase()}`;
  return KEY_CODE_ICON_IDS[code] ?? null;
};

export { keyCodeToIconId };
