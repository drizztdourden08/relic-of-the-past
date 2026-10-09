/* @layer renderer-components @kind types */
import type { Edges } from '@rotp/hud';

interface OffsetFieldProps {
  value: Edges | undefined;
  onChange: (next: Edges | undefined) => void;
  from?: string;
}

export type { OffsetFieldProps };
