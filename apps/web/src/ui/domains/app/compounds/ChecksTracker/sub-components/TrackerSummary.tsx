/* @layer renderer-components @kind component */
import { Box, ProgressBar, Text } from '@drizztdourden08/tessera/primitives';
import { STATUS_LABELS, SUMMARY_STATS } from '../ChecksTracker.constants';
import type { StatusKey, TrackerSummaryProps } from '../ChecksTracker.type';
import { CheckStatusIcon } from './CheckStatusIcon';
import '../ChecksTracker.css';

const TrackerSummary = (props: TrackerSummaryProps) => {
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
        readout={<Text title="Percent complete">{pct}%</Text>}
      />
      <Box className="tracker-summary__stats">
        {SUMMARY_STATS.map(({ key, label }) => (
          <Box key={key} className={`tracker-summary__stat tracker-summary__stat--${key}`} title={STATUS_LABELS[key]}>
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
