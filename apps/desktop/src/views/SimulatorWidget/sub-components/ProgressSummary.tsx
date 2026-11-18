/* @layer renderer-widgets @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Box, StatRow } from '@drizztdourden08/tessera/primitives';
import type { ProgressSummaryProps } from '../SimulatorWidget.type';

const ProgressSummary = (props: ProgressSummaryProps) => {
  const { status, phaseLabel, progress } = props;
  const t = useT();
  const statusLabels = {
    idle: t('views-simulator:status.idle'), running: t('views-simulator:status.running'),
    paused: t('views-simulator:status.paused'), done: t('views-simulator:status.done'),
  };

  const rows: Array<[string, string]> = [
    [t('views-simulator:progress.status'), statusLabels[status]],
    [t('views-simulator:progress.phase'), phaseLabel || progress.phase],
    [t('views-simulator:progress.checks.done'), String(progress.checksDone)],
    [t('views-simulator:progress.discovered'), String(progress.discovered)],
    [t('views-simulator:progress.epoch'), String(progress.epoch)],
    [t('views-simulator:progress.screen'), progress.currentScreen || '-'],
  ];

  return (
    <Box className="simulator__progress">
      {rows.map(([label, value]) => (
        <StatRow key={label} label={label} value={value} mono />
      ))}
    </Box>
  );
};

export { ProgressSummary };
