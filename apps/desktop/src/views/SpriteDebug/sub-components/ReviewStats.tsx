/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
const ReviewStats = ({ counts, total }: { counts: { good: number; neutral: number; bad: number; yellow: number }; total: number }) => {
  return (
    <Box className="sprite-debug-stats">
      <Text className="sprite-debug-label-good">{counts.good} good</Text>
      <Text className="sprite-debug-label-warn">{counts.yellow} re-review</Text>
      <Text className="sprite-debug-label-dim">{counts.neutral} unchecked</Text>
      <Text className="sprite-debug-label-danger">{counts.bad} bad</Text>
      <Text className="sprite-debug-label-muted">/ {total}</Text>
    </Box>
  );
};

export { ReviewStats };
