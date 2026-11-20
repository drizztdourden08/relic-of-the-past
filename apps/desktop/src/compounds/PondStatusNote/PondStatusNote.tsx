/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import type { PondStatusNoteProps } from './PondStatusNote.type';
import './PondStatusNote.css';

const PondStatusNote = (props: PondStatusNoteProps) => {
  const t = useT();
  const { lines } = props;
  if (lines.length === 0) return null;

  return (
    <Box className="pond-status">
      <Text className="pond-status__title">{t('compounds:pond-status-note.title')}</Text>
      {lines.map((sentence) => (
        <Text key={sentence} className="pond-status__line">{sentence}</Text>
      ))}
    </Box>
  );
};

export { PondStatusNote };
