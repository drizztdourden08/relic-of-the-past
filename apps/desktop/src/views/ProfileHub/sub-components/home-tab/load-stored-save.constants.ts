/* @layer renderer-components @kind constants */
import * as savesStore from '@app/storage/saves-store';

const STORED_SAVE_READERS = {
  normal: savesStore.loadNormalSave,
  auto: savesStore.loadAutoSave,
} as const;

export { STORED_SAVE_READERS };
