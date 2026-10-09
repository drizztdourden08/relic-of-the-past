/* @layer bridge-wasm @kind logic */
import type { DeathLinkNotice } from '../online-notices';
import { DOWN_NOTE, SENT_TEXT } from './death-link-toast-text.constants';
import type { DeathLinkToastText } from './death-link-toast-text.type';
import { oneLine } from './one-line';
import { saysNothing } from './says-nothing';

const deathLinkToastText = (notice: DeathLinkNotice): DeathLinkToastText => {
  if (notice.kind === 'sent') return { name: '', text: SENT_TEXT };
  const { kind, source } = notice;
  const cause = oneLine(notice.cause);
  const down = kind === 'dropped';
  if (saysNothing(cause, source)) return { name: source, text: down ? ` died${DOWN_NOTE}` : ' died, and took you along.' };
  const causeOpensWithName = cause.startsWith(`${source} `);
  const rest = causeOpensWithName ? cause.slice(source.length) : ` died: ${cause}`;
  return { name: source, text: down ? `${rest}${DOWN_NOTE}` : rest };
};

export { deathLinkToastText };
