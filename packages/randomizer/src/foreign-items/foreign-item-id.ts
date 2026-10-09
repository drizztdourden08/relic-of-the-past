/* @layer bridge-wasm @kind logic */
import { isGrantableReceiveId } from '@rotp/game-data';
import { getModule } from '@rotp/game-core';
import { hasCoreExport } from '@rotp/game-core';
import { FOREIGN_ITEM_ID } from './foreign-item-sentinel';
import { isForeignIconId } from './is-foreign-icon-id';

const foreignItemId = (): number => {
  if (!hasCoreExport('WasmForeignItemId')) return FOREIGN_ITEM_ID;
  try {
    const id = getModule()?.ccall('WasmForeignItemId', 'number', [], []);
    return typeof id === 'number' && id > 0 ? id : FOREIGN_ITEM_ID;
  } catch {
    return FOREIGN_ITEM_ID;
  }
};

const coreHasForeignIcons = (): boolean => hasCoreExport('WasmForeignIconFirstId');

const isArmableOverrideId = (id: number): boolean =>
  isGrantableReceiveId(id) || id === foreignItemId() || (isForeignIconId(id) && coreHasForeignIcons());

export { isArmableOverrideId };
