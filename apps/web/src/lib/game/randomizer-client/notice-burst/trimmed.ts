/* @layer bridge-wasm @kind logic */
import { MAX_VISIBLE } from './notice-burst.constants';
import type { NoticeEntry } from './notice-burst.type';

const trimmed = (entries: NoticeEntry[], forming: readonly NoticeEntry[]): NoticeEntry[] => {
  const linesSavedByFold = Math.max(0, forming.length - 1);
  let excess = entries.length - linesSavedByFold - MAX_VISIBLE;
  return entries.filter((entry) => {
    if (excess <= 0 || forming.includes(entry)) return true;
    excess -= 1;
    return false;
  });
};

export { trimmed };
