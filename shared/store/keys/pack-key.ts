/* @layer shared-store @kind logic */
import { KIND_FOLDER, PREFIX } from './keys.constants';
import type { KeyItem, KeyVersion } from './keys.type';
import { packName } from './pack-name';

const packKey = (item: KeyItem, v: KeyVersion): string =>
  `${PREFIX.packs}${KIND_FOLDER[item.kind]}/${item.id}/v${v.n}/${packName(item, v)}`;

export { packKey };
