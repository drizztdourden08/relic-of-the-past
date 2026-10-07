/* @layer bridge-wasm @kind logic */
/**
 * The toast line for a DeathLink notice, split so the player's name can be drawn apart from
 * the rest: `name + text` is the whole line. The cause is the sending game's own free text,
 * shown as sent, on one line and cut to a length a toast can hold.
 */
import { noticeOf, playerPart } from './online-notices';
import type { DeathLinkNotice, OnlineNotice } from './online-notices';

const MAX_CAUSE_LENGTH = 90;
const SENT_TEXT = 'Your death was sent to the room.';
const DOWN_NOTE = ' (already down)';

interface DeathLinkToastText {
  /** The player who died; empty for our own death. */
  name: string;
  text: string;
}

const oneLine = (cause: string): string => {
  const flat = cause.replace(/\s+/g, ' ').trim();
  return flat.length > MAX_CAUSE_LENGTH ? `${flat.slice(0, MAX_CAUSE_LENGTH - 3).trimEnd()}...` : flat;
};

/** A cause that says no more than the name does: empty, the name, or "<name> died". */
const saysNothing = (cause: string, source: string): boolean => {
  const bare = cause.toLowerCase().replace(/[.!]+$/, '');
  const name = source.toLowerCase();
  return bare === '' || bare === name || bare === `${name} died`;
};

const deathLinkToastText = (notice: DeathLinkNotice): DeathLinkToastText => {
  if (notice.kind === 'sent') return { name: '', text: SENT_TEXT };
  const { kind, source } = notice;
  const cause = oneLine(notice.cause);
  const down = kind === 'dropped';
  if (saysNothing(cause, source)) return { name: source, text: down ? ` died${DOWN_NOTE}` : ' died, and took you along.' };
  // A cause that opens with the name already reads as a sentence about that player.
  const rest = cause.startsWith(`${source} `) ? cause.slice(source.length) : ` died: ${cause}`;
  return { name: source, text: down ? `${rest}${DOWN_NOTE}` : rest };
};

/** The whole line, for the toast's accessible label and the log. */
const deathLinkToastLine = (notice: DeathLinkNotice): string => {
  const { name, text } = deathLinkToastText(notice);
  return `${name}${text}`;
};

/** The same line as an online notice, the player's name drawn in the player colour. */
const deathLinkOnlineNotice = (notice: DeathLinkNotice): OnlineNotice => {
  const { name, text } = deathLinkToastText(notice);
  return noticeOf('deathLink', name ? [playerPart(name), { text }] : [{ text }]);
};

export { deathLinkOnlineNotice, deathLinkToastLine, deathLinkToastText, MAX_CAUSE_LENGTH };
export type { DeathLinkToastText };
