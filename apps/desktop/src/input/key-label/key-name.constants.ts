/* @layer renderer-app @kind constants */
import type { MessageKey } from '@drizztdourden08/brock-core/i18n';

const KEY_LABEL_KEYS: Readonly<Record<string, MessageKey>> = {
  'Arrow Up': 'profiles:key-label.arrow-up',
  'Arrow Down': 'profiles:key-label.arrow-down',
  'Arrow Left': 'profiles:key-label.arrow-left',
  'Arrow Right': 'profiles:key-label.arrow-right',
  'Arrow keys': 'profiles:key-label.arrow-keys',
  'L.Shift': 'profiles:key-label.left-shift',
  'R.Shift': 'profiles:key-label.right-shift',
  'L.Ctrl': 'profiles:key-label.left-ctrl',
  'R.Ctrl': 'profiles:key-label.right-ctrl',
  'L.Alt': 'profiles:key-label.left-alt',
  'R.Alt': 'profiles:key-label.right-alt',
  Enter: 'profiles:key-label.enter',
  Space: 'profiles:key-label.space',
  Bksp: 'profiles:key-label.backspace',
  Tab: 'profiles:key-label.tab',
  Esc: 'profiles:key-label.escape',
  Caps: 'profiles:key-label.caps-lock',
  'Page Up': 'profiles:key-label.page-up',
  'Page Down': 'profiles:key-label.page-down',
  Ctrl: 'profiles:key-label.ctrl',
  Shift: 'profiles:key-label.shift',
  Alt: 'profiles:key-label.alt',
};

export { KEY_LABEL_KEYS };
