/* @layer renderer-components @kind component */
import { Box, Text } from '../../../../../design-system/primitives';
import { LABEL_STYLES, S } from '../SpriteDebug.constants';

const ReviewStats = ({ counts, total }: { counts: { good: number; neutral: number; bad: number; yellow: number }; total: number }) => {
  return (
    <Box style={S.stats}>
      <Text style={LABEL_STYLES.good}>{counts.good} good</Text>
      <Text style={LABEL_STYLES.warn}>{counts.yellow} re-review</Text>
      <Text style={LABEL_STYLES.dim}>{counts.neutral} unchecked</Text>
      <Text style={LABEL_STYLES.danger}>{counts.bad} bad</Text>
      <Text style={LABEL_STYLES.muted}>/ {total}</Text>
    </Box>
  );
};

export { ReviewStats };
