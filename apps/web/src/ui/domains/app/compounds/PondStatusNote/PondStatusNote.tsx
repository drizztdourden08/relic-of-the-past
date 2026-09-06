/* @layer renderer-components @kind component */
/**
 * The plain-language answer to "what will the pond actually do?", at the top
 * of its tab: one sentence for what it sells and what it costs, one for which
 * capacity families still take their upgrades from it. Bare, because the sentences
 * arrive derived from the live settings, so the block follows an edit rather
 * than being written out by hand.
 */
import { Box, Text } from '@ds/primitives';
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
