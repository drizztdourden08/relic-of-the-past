/* @layer renderer-components @kind component */
import { Box, Text } from '../../../../../design-system/primitives';
import '../TrackerView.css';

interface TrackerSummaryProps {
  completed: number;
  reachable: number;
  blocked: number;
  total: number;
}

const TrackerSummary = (props: TrackerSummaryProps) => {
  const { completed, reachable, blocked, total } = props;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <Box className="tracker-summary">
      <Box className="tracker-summary__bar">
        <Box
          className="tracker-summary__fill tracker-summary__fill--completed"
          style={{ width: `${(completed / total) * 100}%` }}
        />
        <Box
          className="tracker-summary__fill tracker-summary__fill--reachable"
          style={{ width: `${(reachable / total) * 100}%` }}
        />
      </Box>
      <Box className="tracker-summary__stats">
        <Text className="tracker-summary__stat tracker-summary__stat--completed">{completed} done</Text>
        <Text className="tracker-summary__stat tracker-summary__stat--reachable">{reachable} available</Text>
        <Text className="tracker-summary__stat tracker-summary__stat--blocked">{blocked} blocked</Text>
        <Text className="tracker-summary__stat tracker-summary__stat--total">{total} total</Text>
        <Text className="tracker-summary__stat">{pct}%</Text>
      </Box>
    </Box>
  );
}

export { TrackerSummary };
