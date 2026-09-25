/* @layer sanctuary-site @kind component */
/**
 * Said before any edit runs: which picked files the caller may not change, so the type,
 * tag and delete actions will leave them out. Nothing is drawn when every file is theirs.
 */
import type { SanctuaryFile } from '@shared/sanctuary/file-types';
import { Text } from '@ds/primitives/Text';

type SkipNoteProps = {
  skipped: readonly SanctuaryFile[];
  total: number;
};

/** Names listed before the rest is counted. */
const NAMES_SHOWN = 4;

const namesOf = (files: readonly SanctuaryFile[]) => {
  const names = files.slice(0, NAMES_SHOWN).map((file) => file.name).join(', ');
  const rest = files.length - NAMES_SHOWN;
  return rest > 0 ? `${names} and ${rest} more` : names;
};

const SkipNote = (props: SkipNoteProps) => {
  const { skipped, total } = props;
  if (skipped.length === 0) return null;
  const lead = skipped.length === total
    ? 'None of these files are yours, so editing and deleting are off.'
    : `${skipped.length} of ${total} are not yours, so editing and deleting skip them: ${namesOf(skipped)}.`;
  return <Text as="p" variant="caption" role="note" className="selection-panel__skip">{lead}</Text>;
};

export { SkipNote };
export type { SkipNoteProps };
