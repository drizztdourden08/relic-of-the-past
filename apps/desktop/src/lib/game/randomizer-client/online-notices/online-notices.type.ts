/* @layer bridge-wasm @kind types */
import type { OnlineNoticeKind } from '@shared/randomizer/archipelago/online-notice-settings';

type NoticeTone = 'item' | 'player';

interface NoticePart {
  text: string;
  tone?: NoticeTone;
}

interface OnlineNotice {
  kind: OnlineNoticeKind;
  text: string;
  parts: readonly NoticePart[];
  counterpart?: string;
}

type DeathLinkNotice =
  | { kind: 'received' | 'dropped'; source: string; cause: string }
  | { kind: 'sent' };

type OnlineNoticeListener = (notice: OnlineNotice) => void;

export type { DeathLinkNotice, NoticePart, NoticeTone, OnlineNotice, OnlineNoticeListener };
