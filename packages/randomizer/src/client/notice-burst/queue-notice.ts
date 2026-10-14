/* @layer bridge-wasm @kind logic */
import { isNoticeKindShown } from '../../archipelago/online-notice-settings/is-notice-kind-shown';
import { admitNotice } from './admit-notice';
import type { NoticeEntry, QueueNoticeParams } from './notice-burst.type';

const queueNotice = (params: QueueNoticeParams): readonly NoticeEntry[] => {
  const { entries, notice, settings, now, nextId } = params;
  return isNoticeKindShown(settings, notice.kind) ? admitNotice(entries, notice, now, nextId) : entries;
};

export { queueNotice };
