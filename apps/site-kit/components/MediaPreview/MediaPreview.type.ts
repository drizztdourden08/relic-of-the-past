/* @layer site-kit @kind types */
import type { MediaKind } from '../../lib/media-kind';

type MediaPreviewProps = {
  kind: MediaKind;
  src: string | null;
  name: string;
  error: string | null;
  onExpand: (startAt: number) => void;
};

export type { MediaPreviewProps };
