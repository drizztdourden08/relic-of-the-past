/* @layer renderer-components @kind types */
import type { Edges } from '@shared/types/hud';

interface OffsetFieldProps {
  value: Edges | undefined;
  onChange: (next: Edges | undefined) => void;
  from?: string;
}

export type { OffsetFieldProps };
