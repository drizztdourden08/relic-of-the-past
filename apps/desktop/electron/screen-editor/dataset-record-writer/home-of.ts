/* @layer electron-main @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { mainText } from '../../lib/main-text';
import { locateRecordFile } from '../data-files';
import { KIND_ROOTS } from '../id-allocator';
import type { AllocatableKind } from '../id-allocator';

const homeOf = async (
  root: string,
  kind: AllocatableKind,
  id: string,
): Promise<{ path: string } | { error: string }> => {
  const path = await locateRecordFile(root, KIND_ROOTS[kind], id);
  if (!path) return { error: mainText(msg('screen-editor:record.notFound', { id, kind })) };
  return { path };
};

export { homeOf };
