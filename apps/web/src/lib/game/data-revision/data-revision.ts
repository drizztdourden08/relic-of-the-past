/* @layer bridge-wasm @kind logic */
import { revisionState } from './revision-state';

const dataRevision = (): number => revisionState.revision;

export { dataRevision };
