/* @layer renderer-app @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';

const keyName = (raw: string, t: I18n['t']): string => {
  switch (raw) {
    case 'Arrow Up': return t('profiles:key-label.arrow-up');
    case 'Arrow Down': return t('profiles:key-label.arrow-down');
    case 'Arrow Left': return t('profiles:key-label.arrow-left');
    case 'Arrow Right': return t('profiles:key-label.arrow-right');
    case 'Arrow keys': return t('profiles:key-label.arrow-keys');
    case 'L.Shift': return t('profiles:key-label.left-shift');
    case 'R.Shift': return t('profiles:key-label.right-shift');
    case 'L.Ctrl': return t('profiles:key-label.left-ctrl');
    case 'R.Ctrl': return t('profiles:key-label.right-ctrl');
    case 'L.Alt': return t('profiles:key-label.left-alt');
    case 'R.Alt': return t('profiles:key-label.right-alt');
    case 'Enter': return t('profiles:key-label.enter');
    case 'Space': return t('profiles:key-label.space');
    case 'Bksp': return t('profiles:key-label.backspace');
    case 'Tab': return t('profiles:key-label.tab');
    case 'Esc': return t('profiles:key-label.escape');
    case 'Caps': return t('profiles:key-label.caps-lock');
    case 'Page Up': return t('profiles:key-label.page-up');
    case 'Page Down': return t('profiles:key-label.page-down');
    case 'Ctrl': return t('profiles:key-label.ctrl');
    case 'Shift': return t('profiles:key-label.shift');
    case 'Alt': return t('profiles:key-label.alt');
    default: return raw;
  }
};

export { keyName };
