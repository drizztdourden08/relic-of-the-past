/* @layer renderer-widgets @kind logic */
import type { ScreenDraft } from './screen-editor.type';

const interiorKindOf = (draft: ScreenDraft): ScreenDraft['interiorKind'] =>
  (draft.kind === 'interior' ? draft.interiorKind : undefined);

export { interiorKindOf };
