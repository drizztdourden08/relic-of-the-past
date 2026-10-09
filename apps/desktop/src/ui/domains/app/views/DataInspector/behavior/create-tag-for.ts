/* @layer renderer-app @kind logic */
import { isTagKey, registerTag } from '@shared/game/data';
import type { TagCreateResult } from '@drizztdourden08/tessera/composites';
import { TAG_NO_SCOPE, TAG_NOT_CONVENTION } from '../DataInspector.constants';
import { asEntityKind } from './as-entity-kind';
import { registerIdRefOption } from './register-id-ref-option';
import { resolveRecordLabel } from './record-links';
import { invalidateTagSuggestions } from './tag-suggestions';

const createTagFor = async (collectionKind: string, key: string): Promise<TagCreateResult> => {
  const scope = asEntityKind(collectionKind);
  if (!scope) return { success: false, error: TAG_NO_SCOPE };
  if (!isTagKey(key)) return { success: false, error: TAG_NOT_CONVENTION };

  const result = await window.api.screenEditor.allocateTag({ key, appliesTo: [scope] });
  if (!result.success) return { success: false, error: result.error };

  const { record } = result;
  registerTag(record);
  invalidateTagSuggestions();
  registerIdRefOption('tag', {
    value: record.id,
    label: resolveRecordLabel(record.id),
    description: record.id,
  });
  return { success: true, id: record.id };
};

export { createTagFor };
