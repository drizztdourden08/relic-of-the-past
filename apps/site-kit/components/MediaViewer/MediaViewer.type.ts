/* @layer site-kit @kind types */
import type { MediaKind } from '../../lib/media-kind';

type MediaViewerProps = {
  kind: MediaKind;
  src: string;
  name: string;
  startAt: number;
  onClose: () => void;
};

export type { MediaViewerProps };
