/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Box, ProgressBar, Text } from '@drizztdourden08/tessera/primitives';
import { statusLabels, summaryStats } from '../ChecksTracker.constants';
import type { StatusKey, TrackerSummaryProps } from '../ChecksTracker.type';
import { CheckStatusIcon } from './CheckStatusIcon';
import './TrackerSummary.css';

const TrackerSummary = (props: TrackerSummaryProps) => {
  const t = useT();
  const { completed, reachable, blocked, total } = props;
  const counts: Record<StatusKey, number> = { completed, reachable, blocked, total };
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <Box className="tracker-summary">
      <ProgressBar
        value={completed}
        secondaryValue={completed + reachable}
        secondaryTone="primary"
        tone="secondary"
        max={Math.max(total, 1)}
        label={t('compounds:tracker.summary.percent')}
        showValue
        formatValue={() => `${pct}%`}
      />
      <Box className="tracker-summary__stats">
        {summaryStats(t).map(({ key, label }) => (
          <Box key={key} className={`tracker-summary__stat tracker-summary__stat--${key}`} title={statusLabels(t)[key]}>
            <CheckStatusIcon status={key} />
            <Text className="tracker-summary__stat-value">{counts[key]}</Text>
            <Text className="tracker-summary__stat-label">{label}</Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export { TrackerSummary };
