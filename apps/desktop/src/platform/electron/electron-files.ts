/* @layer renderer-other @kind logic */
import { createElectronFactory } from '@drizztdourden08/brock-react';
import type { FileStore } from '@drizztdourden08/brock-core';
import { appApi } from '@app/ipc/app-api';

const createElectronFiles = (): FileStore & { trash: (path: string) => Promise<void> } => ({
  ...createElectronFactory().ports.files(),
  trash: (path: string) => appApi().fileTrash(path),
});

export { createElectronFiles };
