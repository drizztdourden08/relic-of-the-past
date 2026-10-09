/* @layer electron-main @kind logic */
import { locateRecordFile } from '../data-files';
import { KIND_ROOTS } from '../id-allocator';
import type { AllocatableKind } from '../id-allocator';

const homeOf = async (
  root: string,
  kind: AllocatableKind,
  id: string,
): Promise<{ path: string } | { error: string }> => {
  const path = await locateRecordFile(root, KIND_ROOTS[kind], id);
  if (!path) return { error: `Could not find ${id} in any ${kind} source file` };
  return { path };
};

export { homeOf };
