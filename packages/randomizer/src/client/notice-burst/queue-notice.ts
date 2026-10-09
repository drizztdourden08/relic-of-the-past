/* @layer bridge-wasm @kind logic */
import { isNoticeKindShown } from '../../archipelago/online-notice-settings/is-notice-kind-shown';
import type { OnlineNoticeSettings } from '@rotp/features';
import type { OnlineNotice } from '../online-notices';
import { admitNotice } from './admit-notice';
import type { NoticeEntry } from './notice-burst.type';

const queueNotice = (
  entries: readonly NoticeEntry[], notice: OnlineNotice, settings: Partial<OnlineNoticeSettings> | null,
  now: number, nextId: () => string,
): readonly NoticeEntry[] => (isNoticeKindShown(settings, notice.kind) ? admitNotice(entries, notice, now, nextId) : entries);

export { queueNotice };
