/* @layer sanctuary-site @kind component */
import type { SanctuaryFile } from '@rotp/hub-contracts';
import { Text } from '@drizztdourden08/tessera/primitives';
import { NAMES_SHOWN } from './SkipNote.constants';
import type { SkipNoteProps } from './SkipNote.type';

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
