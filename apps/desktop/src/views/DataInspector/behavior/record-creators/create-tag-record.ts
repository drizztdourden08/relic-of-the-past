/* @layer renderer-app @kind logic */
import { requireHostApi } from '@drizztdourden08/brock-react';
import { isTagKey, registerTag } from '@rotp/game-data';
import type { TagRecord } from '@rotp/game-data';
import { TAG_NOT_CONVENTION } from '../../DataInspector.constants';
import type { RecordCreator } from '../record-creators.type';
import { settleCreatedRecord } from '../settle-created-record';
import { invalidateTagSuggestions } from '../tag-suggestions';

const createTagRecord: RecordCreator = async (draft) => {
  const namespace = String(draft.namespace ?? '').trim();
  const value = String(draft.value ?? '').trim();
  const key = `${namespace}:${value}`;
  if (!isTagKey(key)) return { success: false, error: TAG_NOT_CONVENTION };
  const result = await requireHostApi().screenEditor.allocateTag({
    key,
    appliesTo: (draft.appliesTo ?? []) as TagRecord['appliesTo'],
    label: draft.label as string | undefined,
    namespaceLabel: draft.namespaceLabel as string | undefined,
  });
  if (!result.success) return { success: false, error: result.error };
  registerTag(result.record);
  invalidateTagSuggestions();
  return settleCreatedRecord('tag', result.record.id);
};

export { createTagRecord };
