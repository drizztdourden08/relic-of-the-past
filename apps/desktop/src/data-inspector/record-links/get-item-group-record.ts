/* @layer renderer-app @kind logic */
import { itemGroupById } from '@rotp/game-data';
import type { NamedRecord } from '@app/views/DataInspector/DataInspector.type';

const getItemGroupRecord = (id: string): NamedRecord | undefined => {
  const label = itemGroupById(id)?.label;
  return label === undefined ? undefined : { name: label };
};

export { getItemGroupRecord };
