/* @layer electron-main @kind logic */
/**
 * IPC handlers for the review layer. Plain read/write, same as
 * `ui-views/ipc-handlers.ts`. The renderer debounces before calling
 * `review:save` (see the DataInspector behavior's review store), so this
 * handler does no debouncing of its own; it only serializes same-kind writes
 * (see `review-files.ts`).
 */
import { handle } from '../lib/ipc/handle';
import { loadReviewFile, saveReviewEntry } from './review-files';

const registerReviewHandlers = (): void => {
  handle('review:load', (_e, kind) => loadReviewFile(kind));

  handle('review:save', (_e, kind, id, entry) => saveReviewEntry(kind, id, entry));
};

export { registerReviewHandlers };
