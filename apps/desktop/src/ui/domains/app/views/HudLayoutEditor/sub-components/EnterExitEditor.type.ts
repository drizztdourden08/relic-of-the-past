/* @layer renderer-components @kind types */
import type { HudNode } from '@rotp/hud';

interface EnterExitEditorProps {
  node: HudNode;
  onPatch: (patch: Partial<HudNode>) => void;
  scope: Readonly<Record<string, number>>;
  insideRepeat?: boolean;
}

export type { EnterExitEditorProps };
