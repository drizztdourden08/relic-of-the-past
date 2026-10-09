/* @layer renderer-components @kind types */
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';

type LineHere = {
  node: ProseMirrorNode;
  pos: number;
  index: number;
  offset: number;
};

export type { LineHere };
