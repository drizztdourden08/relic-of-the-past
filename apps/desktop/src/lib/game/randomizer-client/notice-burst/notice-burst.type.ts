/* @layer bridge-wasm @kind types */
import type { OnlineNotice } from '../online-notices';

interface NoticeEntry {
  id: string;
  notice: OnlineNotice;
  group: string;
  at: number;
  count: number;
}

export type { NoticeEntry };
