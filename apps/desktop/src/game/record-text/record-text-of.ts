/* @layer renderer-app @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { MessageKey } from '@drizztdourden08/brock-core/i18n';
import { textOf } from '@app/shell/text-bridge';
import { RECORD_CATALOGS } from './record-text.constants';
import type { RecordKind } from './record-text.type';

const recordText = (kind: RecordKind, id: string, field: 'name' | 'note', fallback: string): string => {
  const { namespace, table } = RECORD_CATALOGS[kind];
  const slot = `${id}.${field}`;
  if (!(slot in table)) return fallback;
  return textOf(msg(`${namespace}:${slot}` as MessageKey));
};

export { recordText };
