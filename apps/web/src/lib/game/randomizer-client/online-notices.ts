/* @layer bridge-wasm @kind logic */
/**
 * What the online session tells the player, one notice at a time: items both ways, the room's
 * other finds, hints, the connection, players joining and leaving, goals, releases, DeathLink
 * and chat. The session emits every notice; the play area's toast stack listens and shows the
 * kinds the profile's settings leave on (useOnlineNoticeToasts).
 *
 * A notice is its whole line plus the same line in parts, so an item name and a player name
 * can be drawn in the message highlight colours.
 */
import { createListenerSet } from './listener-set';
import type { OnlineNoticeKind } from '@shared/randomizer/archipelago/online-notice-settings';

type NoticeTone = 'item' | 'player';

interface NoticePart {
  text: string;
  tone?: NoticeTone;
}

interface OnlineNotice {
  kind: OnlineNoticeKind;
  /** The whole line: every part's text, joined. */
  text: string;
  parts: readonly NoticePart[];
  /** The other player an item notice is about, so a burst of them reads as one line. */
  counterpart?: string;
}

/** What DeathLink did: a room death that killed Link or found him down, or ours sent out. */
type DeathLinkNotice =
  | { kind: 'received' | 'dropped'; source: string; cause: string }
  | { kind: 'sent' };

type OnlineNoticeListener = (notice: OnlineNotice) => void;

const listeners = createListenerSet<[OnlineNotice]>();

const onOnlineNotice = (listener: OnlineNoticeListener): (() => void) => listeners.add(listener);

const emitOnlineNotice = (notice: OnlineNotice): void => listeners.emit(notice);

const itemPart = (text: string): NoticePart => ({ text, tone: 'item' });
const playerPart = (text: string): NoticePart => ({ text, tone: 'player' });

const noticeOf = (kind: OnlineNoticeKind, parts: readonly NoticePart[], counterpart?: string): OnlineNotice => ({
  kind,
  text: parts.map((part) => part.text).join(''),
  parts,
  ...(counterpart === undefined ? {} : { counterpart }),
});

export { emitOnlineNotice, itemPart, noticeOf, onOnlineNotice, playerPart };
export type { DeathLinkNotice, NoticePart, NoticeTone, OnlineNotice, OnlineNoticeListener };
