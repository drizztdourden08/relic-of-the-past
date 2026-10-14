/* @layer renderer-app @kind logic */
import type { FieldDescriptor } from '@drizztdourden08/tessera/data';
import { NO_TAG_SUGGESTIONS } from '@app/views/DataInspector/DataInspector.constants';
import { asEntityKind } from '@app/views/DataInspector/behavior/as-entity-kind';
import { suggestionsFor } from './suggestions-for';

const resolveTagSuggestionsFor = (
  collectionKind: string,
  field: FieldDescriptor,
): readonly string[] => {
  const kind = asEntityKind(collectionKind);
  return kind ? suggestionsFor(kind, field.path) : NO_TAG_SUGGESTIONS;
};

export { resolveTagSuggestionsFor };
