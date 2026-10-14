/* @layer renderer-components @kind types */
import type { Paint } from '@rotp/hud';

interface PaintBodyProps {
  label?: string;
  value: Paint;
  onChange: (next: Paint) => void;
  scope: Readonly<Record<string, number>>;
  insideRepeat?: boolean;
}

export type { PaintBodyProps };
