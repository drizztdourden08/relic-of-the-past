/* @layer renderer-components @kind component */
import { Text } from '@drizztdourden08/tessera/primitives';
import { CollapsiblePanel } from './CollapsiblePanel';

const PathControlsLegend = () => {
  return (
    <CollapsiblePanel title="controls">
      <Text className="nav-legend__dim">LMB hold: live A* path to cursor</Text>
      <Text className="nav-legend__dim">RMB while holding: lock target</Text>
      <Text className="nav-legend__dim">Release LMB: clear lock/path</Text>
      <Text className="nav-legend__gold">Shift+drag: copy the selected tiles to the clipboard</Text>
    </CollapsiblePanel>
  );
};

export { PathControlsLegend };
