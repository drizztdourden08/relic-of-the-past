/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import type { PondStatusNoteProps } from './PondStatusNote.type';
import './PondStatusNote.css';

const PondStatusNote = (props: PondStatusNoteProps) => {
  const { lines } = props;
  if (lines.length === 0) return null;

  return (
    <Box className="pond-status">
      <Text className="pond-status__title">what the pond will do</Text>
      {lines.map((sentence) => (
        <Text key={sentence} className="pond-status__line">{sentence}</Text>
      ))}
    </Box>
  );
};

export { PondStatusNote };
