/* @layer bridge-wasm @kind logic */
/**
 * The toast queue's reducer, which folds a burst into one line. A collect or a release sends a
 * room's worth of items in one message, and a toast per item would bury the game. Notices of one
 * group (a kind, and for items the other player) that arrive within BURST_WINDOW_MS of the last
 * one form a burst: the first BURST_LIMIT show as they are, and the next replaces them with a
 * single summary that counts the whole burst ("136 items received from <player>") and keeps
 * counting while the burst lasts.
 */
import { noticeOf, playerPart } from './online-notices';
import type { NoticePart, OnlineNotice } from './online-notices';
import { isNoticeKindShown } from '@shared/randomizer/archipelago/online-notice-settings';
import type { OnlineNoticeKind, OnlineNoticeSettings } from '@shared/randomizer/archipelago/online-notice-settings';

const BURST_LIMIT = 3;
const BURST_WINDOW_MS = 2000;
const MAX_VISIBLE = 5;

interface NoticeEntry {
  id: string;
  notice: OnlineNotice;
  group: string;
  /** When the group last grew. */
  at: number;
  /** How many notices this entry stands for; above 1, it is a burst's summary. */
  count: number;
}

const SUMMARY_TEXT: Readonly<Record<OnlineNoticeKind, [string, string]>> = {
  itemReceived: [' items received from ', ' items received'],
  itemSent: [' items sent to ', ' items sent'],
  ownCheck: [' of your items found', ' of your items found'],
  otherCheck: [' items found by other players', ' items found by other players'],
  hintOwn: [' hints', ' hints'],
  hintOther: [' hints', ' hints'],
  connection: [' connection changes', ' connection changes'],
  join: [' players joined or left', ' players joined or left'],
  goal: [' goals completed', ' goals completed'],
  release: [' releases and collects', ' releases and collects'],
  deathLink: [' deaths', ' deaths'],
  chat: [' chat messages', ' chat messages'],
};

const groupOf = (notice: OnlineNotice): string => `${notice.kind}:${notice.counterpart ?? ''}`;

const summaryOf = (notice: OnlineNotice, count: number): OnlineNotice => {
  const { kind, counterpart } = notice;
  const [toPlayer, alone] = SUMMARY_TEXT[kind];
  const parts: NoticePart[] = counterpart && toPlayer !== alone
    ? [{ text: `${count}${toPlayer}` }, playerPart(counterpart)]
    : [{ text: `${count}${alone}` }];
  return noticeOf(kind, parts, counterpart);
};

/**
 * Drops the oldest entries past MAX_VISIBLE. The singles of |group|, the burst still forming,
 * count as one line, since the next notice may fold them: a burst in progress never pushes out
 * a line of another group that would still fit once it folds.
 */
const trimmed = (entries: NoticeEntry[], forming: readonly NoticeEntry[]): NoticeEntry[] => {
  let excess = entries.length - Math.max(0, forming.length - 1) - MAX_VISIBLE;
  return entries.filter((entry) => {
    if (excess <= 0 || forming.includes(entry)) return true;
    excess -= 1;
    return false;
  });
};

/** The queue after |notice| arrives at |now|; |nextId| names a new entry. */
const admitNotice = (
  entries: readonly NoticeEntry[], notice: OnlineNotice, now: number, nextId: () => string,
): NoticeEntry[] => {
  const group = groupOf(notice);
  const burst = entries.filter((entry) => entry.group === group && now - entry.at <= BURST_WINDOW_MS);
  const summary = burst.find((entry) => entry.count > 1);
  if (summary !== undefined) {
    const count = summary.count + 1;
    return entries.map((entry) => (entry === summary ? { ...entry, notice: summaryOf(notice, count), at: now, count } : entry));
  }
  if (burst.length < BURST_LIMIT) {
    const single: NoticeEntry = { id: nextId(), notice, group, at: now, count: 1 };
    return trimmed([...entries, single], [...burst, single]);
  }
  const count = burst.length + 1;
  const rest = entries.filter((entry) => !burst.includes(entry));
  return trimmed([...rest, { id: nextId(), notice: summaryOf(notice, count), group, at: now, count }], []);
};

/** The toast queue after |notice| arrives: unchanged when the profile turned its kind off. */
const queueNotice = (
  entries: readonly NoticeEntry[], notice: OnlineNotice, settings: Partial<OnlineNoticeSettings> | null,
  now: number, nextId: () => string,
): readonly NoticeEntry[] => (isNoticeKindShown(settings, notice.kind) ? admitNotice(entries, notice, now, nextId) : entries);

export { admitNotice, BURST_LIMIT, BURST_WINDOW_MS, queueNotice };
export type { NoticeEntry };
