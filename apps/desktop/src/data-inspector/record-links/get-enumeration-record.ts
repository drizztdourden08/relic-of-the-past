/* @layer renderer-app @kind logic */
import { all } from '@rotp/game-data';
import type { NamedRecord } from '@app/views/DataInspector/DataInspector.type';

const getEnumerationRecord = (id: string): NamedRecord | undefined => {
  const label = all('enumeration').find(entry => entry.id === id)?.label;
  return label === undefined ? undefined : { name: label };
};

export { getEnumerationRecord };
