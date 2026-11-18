/* @layer renderer-components @kind component */
import { useT, useText } from '@drizztdourden08/brock-react';
import type { Text as TextOf } from '@drizztdourden08/brock-core/i18n';
import { Box, StackedBar, Text } from '@drizztdourden08/tessera/primitives';
import type { StackedBarSegment } from '@drizztdourden08/tessera/primitives';
import { SEGMENTS } from './PoolFillBar.constants';
import type { PoolFillBarProps, PoolFillTotals } from './PoolFillBar.type';
import './PoolFillBar.css';

const segmentsOf = (totals: PoolFillTotals, text: (text: TextOf) => string): StackedBarSegment[] =>
  SEGMENTS.map(({ key, label, description, color }) => ({ id: key, label: text(label), description: text(description), color, value: totals[key] }));

const PoolFillBar = (props: PoolFillBarProps) => {
  const t = useT();
  const text = useText();
  const { totals, error, className = '' } = props;
  const classes = `pool-fill${className ? ` ${className}` : ''}`;
  if (totals === null) {
    return (
      <Box className={classes}>
        <Text className="pool-fill__error">{error ?? t('compounds:pool-fill-bar.unavailable')}</Text>
      </Box>
    );
  }
  const segments = segmentsOf(totals, text);
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  return (
    <Box className={classes}>
      <StackedBar segments={segments} label={t('compounds:pool-fill-bar.bar-label')} legend />
      <Text className="pool-fill__total" title={t('compounds:pool-fill-bar.total-title')}>{t('compounds:pool-fill-bar.total', { total })}</Text>
    </Box>
  );
};

export { PoolFillBar };
