/* @layer renderer-components @kind types */
import type { Edges } from '@shared/types/hud';

type Side = keyof Edges;

interface BoxModelFieldProps {
  margin: Edges | undefined;
  padding: Edges | undefined;
  onMargin: (next: Edges | undefined) => void;
  onPadding: (next: Edges | undefined) => void;
  centre: string;
  marginLocked?: boolean;
}

export type { BoxModelFieldProps, Side };
