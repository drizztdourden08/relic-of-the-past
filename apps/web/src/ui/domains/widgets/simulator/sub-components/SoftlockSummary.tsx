/* @layer renderer-widgets @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import type { SoftlockSummaryProps } from '../SimulatorWidget.type';

const SoftlockSummary = (props: SoftlockSummaryProps) => {
  const { report } = props;
  return (
    <Box className="simulator__softlock">
      <Text className="simulator__softlock-line">{report.completed.length} checks completed.</Text>
      <Text className="simulator__softlock-line">{report.blocked.length} checks left blocked.</Text>
      <Text className="simulator__softlock-line">{report.unreachedScreens.length} screens never reached.</Text>
    </Box>
  );
};

export { SoftlockSummary };
