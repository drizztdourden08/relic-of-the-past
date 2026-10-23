/* @layer renderer-components @kind component */
import { Text } from '@drizztdourden08/tessera/primitives';
import type { ControllerInputState } from '@rotp/input-mapping';

const DebugLine = ({ state }: { state: ControllerInputState }) => (
  <Text className="controller-page__debug">
    t={state.timestamp > 0 ? state.timestamp.toFixed(0) : '-'}
    {' '}btn={state.buttons.filter(Boolean).length}/{state.buttons.length}
    {' '}axes={state.axes.map((axis) => axis.toFixed(1)).join(',')}
  </Text>
);

export { DebugLine };
