/* @layer renderer-components @kind component */
import { Box, Icon, Text } from '@drizztdourden08/tessera/primitives';
import { CollapsiblePanel } from './CollapsiblePanel';

const ArrowLegend = () => {
  return (
    <CollapsiblePanel title="arrows">
      <Box className="nav-legend__row"><Text className="nav-legend__cliff"><Icon name="arrow-right" /></Text><Text className="nav-legend__dim">cliff jump</Text></Box>
      <Box className="nav-legend__row"><Text className="nav-legend__stairs"><Icon name="arrow-right" /></Text><Text className="nav-legend__dim">stairs (bidirectional)</Text></Box>
    </CollapsiblePanel>
  );
};

export { ArrowLegend };
