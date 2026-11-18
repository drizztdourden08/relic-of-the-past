/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
const ReviewStats = ({ counts, total }: { counts: { good: number; neutral: number; bad: number; yellow: number }; total: number }) => {
  const t = useT();
  return (
    <Box className="sprite-debug-stats">
      <Text className="sprite-debug-label-good">{t('views-sprite-debug:stats.good', { count: counts.good })}</Text>
      <Text className="sprite-debug-label-warn">{t('views-sprite-debug:stats.reReview', { count: counts.yellow })}</Text>
      <Text className="sprite-debug-label-dim">{t('views-sprite-debug:stats.unchecked', { count: counts.neutral })}</Text>
      <Text className="sprite-debug-label-danger">{t('views-sprite-debug:stats.bad', { count: counts.bad })}</Text>
      <Text className="sprite-debug-label-muted">{t('views-sprite-debug:stats.total', { total })}</Text>
    </Box>
  );
};

export { ReviewStats };
