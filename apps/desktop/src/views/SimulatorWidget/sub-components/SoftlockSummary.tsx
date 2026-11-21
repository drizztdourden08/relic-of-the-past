/* @layer renderer-widgets @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import type { SoftlockSummaryProps } from '../SimulatorWidget.type';

const SoftlockSummary = (props: SoftlockSummaryProps) => {
  const { report } = props;
  const t = useT();
  return (
    <Box className="simulator__softlock">
      <Text className="simulator__softlock-line">{t('views-simulator:softlock.completed', { count: report.completed.length })}</Text>
      <Text className="simulator__softlock-line">{t('views-simulator:softlock.blocked', { count: report.blocked.length })}</Text>
      <Text className="simulator__softlock-line">{t('views-simulator:softlock.screens', { count: report.unreachedScreens.length })}</Text>
    </Box>
  );
};

export { SoftlockSummary };
