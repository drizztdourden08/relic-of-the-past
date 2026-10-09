/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { DisabledOverlay } from '@drizztdourden08/tessera/composites';
import { SCRIM, TITLE } from './UnbuiltPane.constants';
import type { UnbuiltPaneProps } from './UnbuiltPane.type';
import './UnbuiltPane.css';

const UnbuiltPane = (props: UnbuiltPaneProps) => {
  const { summary, children } = props;

  return (
    <Box className="unbuilt-pane">
      <Box className="unbuilt-pane__notice" role="status">
        <Text as="span" className="unbuilt-pane__title">{TITLE}</Text>
        <Text as="span" variant="caption" className="unbuilt-pane__summary">{summary}</Text>
      </Box>

      <DisabledOverlay active contained message={SCRIM} className="unbuilt-pane__body">
        {children}
      </DisabledOverlay>
    </Box>
  );
};

export { UnbuiltPane };
