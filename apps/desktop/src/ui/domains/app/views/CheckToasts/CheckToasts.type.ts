/* @layer renderer-components @kind types */
import type { CheckRecord, ItemId } from '@shared/game/data';
import type { OnlineNotice } from '@app/lib/game/randomizer-client';

interface CheckToastsProps {
  width: number;
  height: number;
}

interface CheckToastEntry {
  id: string;
  check: CheckRecord;
  paid?: ItemId;
}

interface OnlineNoticeToastProps {
  notice: OnlineNotice;
}

export type { CheckToastEntry, CheckToastsProps, OnlineNoticeToastProps };
