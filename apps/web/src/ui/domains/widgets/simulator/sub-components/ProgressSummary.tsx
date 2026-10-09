/* @layer renderer-widgets @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import type { ProgressSummaryProps } from '../SimulatorWidget.type';

const ProgressSummary = (props: ProgressSummaryProps) => {
  const { status, phaseLabel, progress } = props;

  const rows: Array<[string, string]> = [
    ['Status', status],
    ['Phase', phaseLabel || progress.phase],
    ['Checks done', String(progress.checksDone)],
    ['Discovered', String(progress.discovered)],
    ['Epoch', String(progress.epoch)],
    ['Virtual screen', progress.currentScreen || '-'],
  ];

  return (
    <Box className="simulator__progress">
      {rows.map(([label, value]) => (
        <Box key={label} className="simulator__progress-row">
          <Text className="simulator__progress-label">{label}</Text>
          <Text className="simulator__progress-value">{value}</Text>
        </Box>
      ))}
    </Box>
  );
};

export { ProgressSummary };
