/* @layer renderer-other @kind logic */
import { createElectronFactory } from '@drizztdourden08/brock-react';
import type { FileStore } from '@shared/platform';
import { appApi } from '@app/ipc/app-api';

const createElectronFiles = (): FileStore => ({
  ...createElectronFactory().ports.files(),
  trash: (path) => appApi().fileTrash(path),
});

export { createElectronFiles };
