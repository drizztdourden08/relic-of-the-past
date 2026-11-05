/* @layer renderer-components @kind types */
import type { CheckRecord, ItemId } from '@rotp/game-data';
import type { OnlineNotice } from '@drizztdourden08/brock-randomizer/archipelago';

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
