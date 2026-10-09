/* @layer bridge-wasm @kind types */
import type { OnlineNoticeKind } from '@rotp/features';

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
