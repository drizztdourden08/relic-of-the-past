/* @layer renderer-components @kind component */
import { Box } from '../../../../design-system/primitives/Box';
import { Text } from '../../../../design-system/primitives/Text';
import { formatSessionDate, formatDuration } from './behavior/formatters';
import './PlaySessionCard.css';
import { type PlaySessionCardProps } from './PlaySessionCard.type';

const PlaySessionCard = (props: PlaySessionCardProps) => {
  const { session } = props;

  return (
    <Box className="session-card">
      <Box className="session-card__dot" />
      <Text className="session-card__date">{formatSessionDate(session.startedAt)}</Text>
      {session.endedAt && (
        <Text className="session-card__end">→ {new Date(session.endedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</Text>
      )}
      <Text className="session-card__duration">{formatDuration(session.durationMs)}</Text>
    </Box>
  );
};

export {
  PlaySessionCard,
};
