/* @layer shared-store @kind logic */
import { PREFIX } from './keys.constants';
import type { KeyItem, KeyVersion } from './keys.type';
import { packName } from './pack-name';

const incomingKey = (item: KeyItem, v: KeyVersion): string =>
  `${PREFIX.incoming}${item.id}/v${v.n}/${packName(item, v)}`;

export { incomingKey };
