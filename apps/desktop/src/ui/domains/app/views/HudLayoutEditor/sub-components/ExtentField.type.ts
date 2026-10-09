/* @layer renderer-components @kind types */
import type { Extent } from '@rotp/hud';

interface ExtentFieldProps {
  label: string;
  value: Extent | undefined;
  onChange: (next: Extent | undefined) => void;
  bare?: boolean;
}

export type { ExtentFieldProps };
