/* @layer shared-game @kind logic */
import type { Identifiable } from './id.type';

const identityOf = (draft: Identifiable): string => JSON.stringify([
  draft.kind,
  draft.action,
  draft.detector,
  draft.screenId ?? '',
  draft.targetId ?? '',
  draft.key ?? '',
]);

export { identityOf };
