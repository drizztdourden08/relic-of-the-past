/* @layer renderer-lib @kind logic */
import { KEY_CODE_LABELS } from './binding-display.constants';

const formatKeyCode = (code: string): string => {
  if (code.startsWith('Key')) return code.slice(3);
  if (code.startsWith('Digit')) return code.slice(5);
  return KEY_CODE_LABELS[code] ?? code;
};

export { formatKeyCode };
