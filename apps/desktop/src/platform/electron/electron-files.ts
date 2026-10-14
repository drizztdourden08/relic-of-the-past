/* @layer renderer-other @kind logic */
import { createElectronFactory, requireHostApi } from '@drizztdourden08/brock-react';
import type { FileStore } from '@drizztdourden08/brock-core';

const createElectronFiles = (): FileStore & { trash: (path: string) => Promise<void> } => ({
  ...createElectronFactory().ports.files(),
  trash: (path: string) => requireHostApi().fileTrash(path),
});

export { createElectronFiles };
