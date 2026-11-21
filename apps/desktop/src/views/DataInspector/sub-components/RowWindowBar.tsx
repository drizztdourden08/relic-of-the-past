/* @layer renderer-app @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Box, Button, Text } from '@drizztdourden08/tessera/primitives';
import { ROW_PAGE_SIZE } from '../DataInspector.constants';
import type { RowWindowBarProps } from './RowWindowBar.type';

const RowWindowBar = (props: RowWindowBarProps) => {
  const { shown, total, onShowMore, onShowAll } = props;
  const t = useT();
  if (shown >= total) return null;
  const next = Math.min(ROW_PAGE_SIZE, total - shown);

  return (
    <Box className="data-inspector__window">
      <Text variant="caption" tone="muted" numeric>{t('views-data-inspector:window.showing', { shown, total })}</Text>
      <Button variant="tertiary" size="sm" onClick={onShowMore}>{t('views-data-inspector:window.more', { count: next })}</Button>
      <Button variant="ghost" size="sm" onClick={onShowAll}>{t('views-data-inspector:window.all')}</Button>
    </Box>
  );
};

export { RowWindowBar };
