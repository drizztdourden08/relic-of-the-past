/* @layer renderer-components @kind types */
import type { CSSProperties } from 'react';

interface PromoteBox {
  '--promote-left': string;
  '--promote-top': string;
  '--promote-width': string;
  '--promote-height': string;
}

interface PromoteOverlay { className: string; style: CSSProperties | undefined }

export type { PromoteBox, PromoteOverlay };
