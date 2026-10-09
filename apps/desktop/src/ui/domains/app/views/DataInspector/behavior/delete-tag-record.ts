/* @layer renderer-app @kind logic */
import { appApi } from '@app/ipc/app-api';
import { unregisterTag } from '@rotp/game-data';
import type { TagId } from '@rotp/game-data';
import type { DeleteResult } from '../DataInspector.type';
import { invalidateTagSuggestions } from './tag-suggestions';
import { unregisterIdRefOption } from './unregister-id-ref-option';

const deleteTagRecord = async (id: string): Promise<DeleteResult> => {
  const result = await appApi().screenEditor.deleteTag({ tagId: id as TagId });
  if (!result.success) return { success: false, error: result.error };
  unregisterTag(id);
  invalidateTagSuggestions();
  unregisterIdRefOption('tag', id);
  return { success: true };
};

export { deleteTagRecord };
