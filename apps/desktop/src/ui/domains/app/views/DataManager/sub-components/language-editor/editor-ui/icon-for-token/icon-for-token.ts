/* @layer renderer-components @kind logic */
import type { IconifyIcon } from '@iconify/types';
import type { Token } from '@shared/game/language';
import { FALLBACK_ICON, GLOSSARY_ICON } from './icon-for-token.constants';
import { iconForCodeName } from './icon-for-code-name';

const iconForToken = (token: Token): IconifyIcon => {
  if (token.t === 'cmd') return iconForCodeName(token.name);
  if (token.t === 'break') return iconForCodeName(String(token.row));
  if (token.t === 'var') return iconForCodeName(token.name === 'player-name' ? 'Name' : 'Number');
  if (token.t === 'ref') return GLOSSARY_ICON;
  return FALLBACK_ICON;
};

export { iconForToken };
