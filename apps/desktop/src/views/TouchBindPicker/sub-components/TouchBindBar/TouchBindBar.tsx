/* @layer renderer-app @kind component */
import { Box, Button, ButtonRow, Text } from '@drizztdourden08/tessera/primitives';
import type { TouchBindBarProps } from './TouchBindBar.type';
import './TouchBindBar.css';

const TouchBindBar = (props: TouchBindBarProps) => {
  const { actionLabel, onCancel, onDefault } = props;

  return (
    <Box className="touch-bind-bar">
      <Text variant="title">{actionLabel}</Text>
      <Text variant="caption" tone="faint">Touch a control to bind it</Text>
      <ButtonRow align="center">
        <Button variant="secondary" size="sm" onClick={onCancel}>Cancel</Button>
        {onDefault && <Button variant="tertiary" size="sm" onClick={onDefault}>Default</Button>}
      </ButtonRow>
    </Box>
  );
};

export { TouchBindBar };
