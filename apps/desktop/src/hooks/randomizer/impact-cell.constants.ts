/* @layer renderer-lib @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Text } from '@drizztdourden08/brock-core/i18n';
const NOTE_LABEL: Readonly<Record<string, Text>> = {
  'n/a': msg('randomizer:impact.note.unused'),
  '0 shuffled': msg('randomizer:impact.note.unshuffled'),
};

export { NOTE_LABEL };
