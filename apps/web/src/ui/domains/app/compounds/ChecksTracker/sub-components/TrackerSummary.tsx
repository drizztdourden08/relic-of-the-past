/* @layer renderer-components @kind component */
import { Box, ProgressBar, Text } from '@ds/primitives';
import { CheckStatusIcon, STATUS_LABELS } from './CheckStatusIcon';
import type { StatusKey } from './CheckStatusIcon';
import '../ChecksTracker.css';

interface TrackerSummaryProps {
  completed: number;
  reachable: number;
  blocked: number;
  total: number;
}

// Wording is the reader's, not the model's: a check is one you have taken, one
// you can go and take now, or one still out of reach.
const STATS: { key: StatusKey; label: string }[] = [
  { key: 'completed', label: 'taken' },
  { key: 'reachable', label: 'available' },
  { key: 'blocked', label: 'left' },
  { key: 'total', label: 'total' },
];

const TrackerSummary = (props: TrackerSummaryProps) => {
  const { completed, reachable, blocked, total } = props;
  const counts: Record<StatusKey, number> = { completed, reachable, blocked, total };
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <Box className="tracker-summary">
      <Box className="tracker-summary__meter">
        <ProgressBar
          className="tracker-summary__bar"
          value={completed}
          secondaryValue={completed + reachable}
          secondaryVariant="gold"
          variant="green"
          max={Math.max(total, 1)}
        />
        <Text className="tracker-summary__pct" title="Percent complete">{pct}%</Text>
      </Box>
      <Box className="tracker-summary__stats">
        {STATS.map(({ key, label }) => (
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
