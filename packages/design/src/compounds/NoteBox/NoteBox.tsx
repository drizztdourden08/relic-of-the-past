/* @layer site-kit @kind component */
import { Text } from '@drizztdourden08/tessera/primitives';
import type { NoteBoxProps } from './NoteBox.type';
import './NoteBox.css';

const NoteBox = (props: NoteBoxProps) => {
  const { children, accent = false } = props;
  return (
    <Text as="p" className="note-box" data-accent={accent ? '' : undefined}>{children}</Text>
  );
};

export { NoteBox };
