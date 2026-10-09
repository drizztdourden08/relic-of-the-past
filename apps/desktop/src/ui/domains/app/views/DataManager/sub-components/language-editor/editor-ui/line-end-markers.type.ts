/* @layer renderer-components @kind types */
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';

type AdvanceMarker = { className: string; title: string; icon: string; key: string };

type LineNode = { node: ProseMirrorNode; pos: number };

export type { AdvanceMarker, LineNode };
