/* @layer renderer-components @kind types */
import type { HudPlace } from '@rotp/hud';

type Refusal =
  | 'self'
  | 'descendant'
  | 'not-a-container'
  | 'source-locked'
  | 'target-locked'
  | 'grid-column'
  | 'budget';

type DropIntent =
  | { kind: 'flex'; parentId: string; index: number }
  | { kind: 'grid'; parentId: string; place: HudPlace; onto: string | null }
  | { kind: 'refused'; reason: Refusal; parentId: string | null; nodeId: string | null };

interface Stop { reason: Refusal; nodeId: string | null }

type DropZone = 'before' | 'inside-start' | 'inside-end' | 'after';

export type { DropIntent, DropZone, Refusal, Stop };
