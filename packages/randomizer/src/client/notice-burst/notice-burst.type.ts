/* @layer bridge-wasm @kind types */
import type { OnlineNoticeSettings } from '@rotp/features';
import type { OnlineNotice } from '../online-notices';

interface NoticeEntry {
  id: string;
  notice: OnlineNotice;
  group: string;
  at: number;
  count: number;
}

interface QueueNoticeParams {
  entries: readonly NoticeEntry[];
  notice: OnlineNotice;
  settings: Partial<OnlineNoticeSettings> | null;
  now: number;
  nextId: () => string;
}

export type { NoticeEntry, QueueNoticeParams };
