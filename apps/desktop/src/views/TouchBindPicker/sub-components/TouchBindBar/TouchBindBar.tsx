/* @layer renderer-app @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Box, Button, ButtonRow, Text } from '@drizztdourden08/tessera/primitives';
import type { TouchBindBarProps } from './TouchBindBar.type';
import './TouchBindBar.css';

const TouchBindBar = (props: TouchBindBarProps) => {
  const t = useT();
  const { actionLabel, onCancel, onDefault } = props;

  return (
    <Box className="touch-bind-bar">
      <Text variant="title">{actionLabel}</Text>
      <Text variant="caption" tone="faint">{t('views-touch-controls:bind.hint')}</Text>
      <ButtonRow align="center">
        <Button variant="secondary" size="sm" onClick={onCancel}>{t('views-touch-controls:bind.cancel')}</Button>
        {onDefault && <Button variant="tertiary" size="sm" onClick={onDefault}>{t('views-touch-controls:bind.default')}</Button>}
      </ButtonRow>
    </Box>
  );
};

export { TouchBindBar };
