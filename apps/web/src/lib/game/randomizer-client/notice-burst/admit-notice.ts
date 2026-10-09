/* @layer bridge-wasm @kind logic */
import type { OnlineNotice } from '../online-notices';
import { BURST_LIMIT, BURST_WINDOW_MS } from './notice-burst.constants';
import type { NoticeEntry } from './notice-burst.type';
import { summaryOf } from './summary-of';
import { trimmed } from './trimmed';

const groupOf = (notice: OnlineNotice): string => `${notice.kind}:${notice.counterpart ?? ''}`;

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

export { admitNotice };
