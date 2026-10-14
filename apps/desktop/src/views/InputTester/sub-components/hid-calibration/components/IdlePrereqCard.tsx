/* @layer renderer-components @kind component */
import { Box, Text, Button, Icon } from '@drizztdourden08/tessera/primitives';
import { IDLE_DESCRIPTION } from './PrereqCards.constants';
import type { IdlePrereqCardProps } from './PrereqCards.type';

const IdlePrereqCard = (props: IdlePrereqCardProps) => {
  const { idleState, latestBytesLength, onIdleCapture, onIdleRedo } = props;

  return (
    <Box className={`hid-cal__prereq-card${idleState === 'done' ? ' hid-cal__prereq-card--done' : ''}`}>
      <Box className="hid-cal__prereq-title">
        <Text>{idleState === 'done' ? <Icon name="check" /> : '2.'} Idle Baseline</Text>
      </Box>
      <Text as="p" className="hid-cal__desc">{IDLE_DESCRIPTION[idleState]}</Text>
      <Box className="hid-cal__prereq-actions">
        {idleState === 'idle' && (
          <Button variant="primary" size="sm" onClick={onIdleCapture} disabled={latestBytesLength === 0}>Capture Idle</Button>
        )}
        {idleState === 'done' && (
          <Button variant="tertiary" size="sm" onClick={onIdleRedo}>Redo</Button>
        )}
      </Box>
    </Box>
  );
};

export { IdlePrereqCard };
