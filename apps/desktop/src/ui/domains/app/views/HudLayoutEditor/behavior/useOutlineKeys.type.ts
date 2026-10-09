/* @layer renderer-components @kind types */
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import type { DropIntent } from './drop-intent';
import type { StepDirection } from './step-intent';
import type { HudLayout } from '@shared/types/hud';

interface OutlineKeysInput {
  doc: HudLayout;
  onDrop: (ids: readonly string[], intent: DropIntent) => void;
}

interface OutlineKeys {
  message: string;
  shaking: string | null;
  step: (id: string, direction: StepDirection) => void;
  onRowKeyDown: (id: string, event: ReactKeyboardEvent) => void;
}

export type { OutlineKeys, OutlineKeysInput };
