/* @layer renderer-components @kind component */
import { useCallback, useEffect } from 'react';
import { useT } from '@drizztdourden08/brock-react';
import { Box, Icon, IconButton } from '@drizztdourden08/tessera/primitives';
import type { PlayAreaNoticeProps } from './PlayAreaNotice.type';

const PlayAreaNotice = (props: PlayAreaNoticeProps) => {
  const { item, duration, onDismiss } = props;
  const { id } = item;
  const t = useT();
  const dismiss = useCallback(() => onDismiss(id), [id, onDismiss]);

  useEffect(() => {
    if (duration <= 0) return undefined;
    const timer = setTimeout(dismiss, duration);
    return () => clearTimeout(timer);
  }, [duration, dismiss]);

  return (
    <Box className="play-area-notice" role="status" aria-label={item.label}>
      <Box className="play-area-notice__content">{item.content}</Box>
      <IconButton variant="ghost" size="xs" label={t('views-game-layer:notice.dismiss')} onClick={dismiss}>
        <Icon name="x" />
      </IconButton>
    </Box>
  );
};

export { PlayAreaNotice };
