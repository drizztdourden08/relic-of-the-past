/* @layer renderer-components @kind types */
import type { CSSProperties } from 'react';
import type { GhostModel } from '../../behavior/drop-ghost';

interface DragGhostProps {
  model: GhostModel | null;
}

interface GhostCardProps { model: GhostModel; style?: CSSProperties }

export type { DragGhostProps, GhostCardProps };
