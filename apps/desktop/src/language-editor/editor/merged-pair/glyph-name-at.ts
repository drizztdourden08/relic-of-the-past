/* @layer renderer-components @kind logic */
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { DIALOGUE_TOKEN_TYPE } from '../token-attrs';

const glyphNameAt = (doc: ProseMirrorNode, pos: number): string | null => {
  if (pos < 0 || pos >= doc.content.size) return null;
  const node = doc.nodeAt(pos);
  if (node?.type.name !== DIALOGUE_TOKEN_TYPE) return null;
  const { kind, name } = node.attrs;
  return kind === 'cmd' && typeof name === 'string' ? name : null;
};

export { glyphNameAt };
