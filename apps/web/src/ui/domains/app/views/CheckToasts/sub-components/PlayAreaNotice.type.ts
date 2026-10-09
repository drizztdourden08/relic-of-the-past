/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';

interface PlayAreaNoticeItem {
  id: string;
  label: string;
  content: ReactNode;
}

interface PlayAreaNoticeProps {
  item: PlayAreaNoticeItem;
  duration: number;
  onDismiss: (id: string) => void;
}

export type { PlayAreaNoticeItem, PlayAreaNoticeProps };
