/* @layer site-kit @kind types */
import type { MediaKind } from '@rotp/hub-client';

type MediaViewerProps = {
  kind: MediaKind;
  src: string;
  name: string;
  startAt: number;
  onClose: () => void;
};

export type { MediaViewerProps };
