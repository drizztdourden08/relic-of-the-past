/* @layer renderer-components @kind component */
/**
 * The entry as prose: the words, and nothing else.
 *
 * No gutter, no markers, no chips, no pixel face. Structure and fit are what the
 * other two views are for, and both of those crowd out the one question this
 * view answers, which is whether this reads well in the target language. So the
 * control codes are gone, the substitutions are already standing in for their
 * values, and the line is set in the app's own face at a comfortable measure.
 *
 * The text is selectable and copyable, because passing a line to a dictionary or
 * a colleague is the commonest thing done from here.
 */
import { Box, Text } from '@ds/primitives';
import './ReadView.css';

type ReadViewProps = {
  /** The already-expanded prose (`entry-prose.ts`). */
  prose: string;
  /** The translator's own note on this entry, if any. */
  note?: string;
};

const ReadView = (props: ReadViewProps) => {
  const { prose, note } = props;

  return (
    <Box className="read-view">
      {prose.trim().length > 0 ? (
        <Text as="p" className="read-view__prose">{prose}</Text>
      ) : (
        <Text as="p" variant="caption" className="read-view__empty">This entry has no words.</Text>
      )}
      {note ? (
        <Text as="p" variant="caption" className="read-view__note">{note}</Text>
      ) : null}
    </Box>
  );
};

export { ReadView };
export type { ReadViewProps };
