/* @layer renderer-app @kind logic */
import { asEntityKind } from '@app/views/DataInspector/behavior/as-entity-kind';
import { entityKindFromId } from './entity-kind-from-id';
import { RECORD_GETTERS } from './record-links.constants';

const defaultIdRefDisplay = (id: string, targetKindHint?: string): string | undefined => {
  const kind = asEntityKind(targetKindHint) ?? entityKindFromId(id);
  const getter = kind && RECORD_GETTERS[kind];
  if (!getter) return undefined;
  return getter(id)?.name;
};

export { defaultIdRefDisplay };
