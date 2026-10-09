/* @layer shared-game @kind types */
import type { GridPos } from '@rotp/game-core';
import type { CheckId } from '@rotp/game-data';

type PickupAnnotationKind = 'chest' | 'big-chest' | 'npc-check' | 'standing-item';

type BarrierAnnotationKind = 'key-door' | 'big-key-door' | 'cell-lock' | 'shutter' | 'bombable' | 'follower-gate';

type TriggerAnnotationKind = 'pull-switch' | 'kill-trigger' | 'key-carrier' | 'big-key-carrier';

type UnmappedAnnotationKind = 'unknown';

type AnnotationKind = PickupAnnotationKind | BarrierAnnotationKind | TriggerAnnotationKind | UnmappedAnnotationKind;

type AnnotationState = 'open' | 'shut' | 'done' | 'available' | 'blocked';

interface ScreenAnnotation {
  kind: AnnotationKind;
  tile: GridPos;
  layer?: 0 | 1;
  direction?: 'n' | 's' | 'e' | 'w';
  label: string;
  checkId?: CheckId;
  state?: AnnotationState;
  detail?: string;
  requires?: string[];
}

interface ScreenTag {
  value: number;
  name: string;
}

interface ScreenAnnotations {
  screenId: string;
  screenIndex: number;
  items: ScreenAnnotation[];
  checks: { done: number; available: number; blocked: number };
  tags?: readonly ScreenTag[];
}

export type { AnnotationKind, AnnotationState, ScreenAnnotation, ScreenAnnotations, ScreenTag };
