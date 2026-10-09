/* @layer renderer-lib @kind logic */
import type { ServerSetupDraft } from './server-setup-draft.type';
import { absorbPort } from './absorbPort';

const withHost = (draft: ServerSetupDraft, host: string): ServerSetupDraft => {
  const next = { ...draft, host };
  const isPaste = host.length - draft.host.length > 1;
  return isPaste ? absorbPort(next) : next;
};

export { withHost };
