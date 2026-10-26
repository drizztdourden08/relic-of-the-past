/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { DisabledOverlay } from '@drizztdourden08/tessera/composites';
import type { UnbuiltPaneProps } from './UnbuiltPane.type';
import './UnbuiltPane.css';

const UnbuiltPane = (props: UnbuiltPaneProps) => {
  const { children } = props;

  return (
    <Box className="unbuilt-pane">
      <DisabledOverlay active contained tone="warning" placement="top" className="unbuilt-pane__body">
        {children}
      </DisabledOverlay>
    </Box>
  );
};

export { UnbuiltPane };
