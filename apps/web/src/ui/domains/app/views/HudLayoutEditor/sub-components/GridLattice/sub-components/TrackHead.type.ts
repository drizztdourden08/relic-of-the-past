/* @layer renderer-components @kind types */
import type { PointerEvent } from 'react';
import type { Extent } from '@shared/types/hud';
import type { TrackAxis } from '../GridLattice.type';

interface TrackHeadProps {
  axis: TrackAxis;
  index: number;
  text: string;
  extent: Extent | undefined;
  selected: boolean;
  empty: boolean;
  title: string;
  onPointerDown?: (event: PointerEvent) => void;
  onSize?: (extent: Extent) => void;
}

export type { TrackHeadProps };
