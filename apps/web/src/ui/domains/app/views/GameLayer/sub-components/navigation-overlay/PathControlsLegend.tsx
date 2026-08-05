/* @layer renderer-components @kind component */
import type { CSSProperties } from 'react';
import { Text } from '@ds/primitives/Text';
import { CollapsiblePanel } from './CollapsiblePanel';

const S: Record<string, CSSProperties> = {
  dim: { color: 'var(--c-text-dim)' },
  gold: { color: 'var(--c-gold)' },
};

/** How to drive the overlay. Sits top-left, out of the way of the legends. */
const PathControlsLegend = () => {
  return (
    <CollapsiblePanel title="controls">
      <Text style={S.dim}>LMB hold: live A* path to cursor</Text>
      <Text style={S.dim}>RMB while holding: lock target</Text>
      <Text style={S.dim}>Release LMB: clear lock/path</Text>
      <Text style={S.gold}>Shift+drag: select tiles → clipboard</Text>
    </CollapsiblePanel>
  );
};

export { PathControlsLegend };
