/* @layer renderer-components @kind logic */
/** A group node's `key` is only the stringified value and can repeat across levels, so collapse state needs an identity that includes the ancestry. */
import type { GroupedRow } from '../../../data/table/types';

/** A separator no dot-path contains, so an ancestry cannot be forged by a value. */
const SEPARATOR = ' > ';

const groupUid = (parentUid: string, path: string, key: string): string =>
  `${parentUid}${SEPARATOR}${path}=${key}`;

/** Every group node in the tree, depth-first. Seeds "expanded by default". */
const collectGroupUids = (nodes: readonly GroupedRow<unknown>[], parentUid = ''): readonly string[] =>
  nodes.flatMap((node) => {
    if (node.kind === 'row') return [];
    const uid = groupUid(parentUid, node.path, node.key);
    return [uid, ...collectGroupUids(node.children, uid)];
  });

export { collectGroupUids, groupUid };
