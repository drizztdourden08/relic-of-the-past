/* @layer bridge-wasm @kind logic */
import { revisionState } from './revision-state';

const bumpDataRevision = (): void => {
  revisionState.revision += 1;
  for (const listener of revisionState.listeners) listener();
};

export { bumpDataRevision };
