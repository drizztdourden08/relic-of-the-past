/* @layer renderer-lib @kind logic */
import type { ServerSetupDraft } from './server-setup-draft.type';

const isSameDraft = (a: ServerSetupDraft, b: ServerSetupDraft): boolean =>
  a.host === b.host && a.port === b.port && a.password === b.password && a.slotName === b.slotName;

export { isSameDraft };
