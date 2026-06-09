/* @layer renderer-components @kind component */
import { Box, Text } from '../../../../../design-system/primitives';
import '../TrackerView.css';

interface TrackerSummaryProps {
  completed: number;
  reachable: number;
  blocked: number;
  total: number;
}

const STATS = [
  { key: 'completed', label: 'done', icon: '✓', title: 'Completed' },
  { key: 'reachable', label: 'available', icon: '●', title: 'Available' },
  { key: 'blocked', label: 'blocked', icon: '✕', title: 'Blocked' },
  { key: 'total', label: 'total', icon: 'Σ', title: 'Total' },
] as const;

const TrackerSummary = (props: TrackerSummaryProps) => {
  const { completed, reachable, blocked, total } = props;
  const counts = { completed, reachable, blocked, total };
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <Box className="tracker-summary">
      <Box className="tracker-summary__bar">
        <Box className="tracker-summary__fill tracker-summary__fill--completed" style={{ width: `${(completed / total) * 100}%` }} />
        <Box className="tracker-summary__fill tracker-summary__fill--reachable" style={{ width: `${(reachable / total) * 100}%` }} />
      </Box>
      <Box className="tracker-summary__stats">
        {STATS.map(s => (
          <Text key={s.key} className={`tracker-summary__stat tracker-summary__stat--${s.key}`} title={s.title}>
            {counts[s.key]}
            <Box as="span" className="tracker-summary__stat-label"> {s.label}</Box>
            <Box as="span" className="tracker-summary__stat-icon"> {s.icon}</Box>
          </Text>
        ))}
        <Text className="tracker-summary__stat tracker-summary__stat--pct" title="Percent complete">{pct}%</Text>
      </Box>
    </Box>
  );
};

export { TrackerSummary };
