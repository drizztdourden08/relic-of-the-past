/* @layer renderer-widgets @kind component */
/**
 * Compact live readout of the run: status, current phase/action, checks done,
 * interactables discovered, epoch count and the virtual screen.
 */
import { Box, Text } from '@ds/primitives';
import type { RunStatus, SimProgress } from '@app/stores/simulator-store';

interface ProgressSummaryProps {
  status: RunStatus;
  phaseLabel: string;
  progress: SimProgress;
}

const ProgressSummary = (props: ProgressSummaryProps) => {
  const { status, phaseLabel, progress } = props;

  const rows: Array<[string, string]> = [
    ['Status', status],
    ['Phase', phaseLabel || progress.phase],
    ['Checks done', String(progress.checksDone)],
    ['Discovered', String(progress.discovered)],
    ['Epoch', String(progress.epoch)],
    ['Virtual screen', progress.currentScreen || '—'],
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
