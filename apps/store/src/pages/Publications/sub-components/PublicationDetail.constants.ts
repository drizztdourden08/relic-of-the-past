/* @layer store-site @kind constants */
import type { StoreVersion } from '@rotp/hub-contracts';

const STATE_NOTES: Partial<Record<StoreVersion['review']['state'], string>> = {
  ready: 'Uploaded and checked. Send it for review when you are ready.',
  rejected: 'Read the note, then resubmit this file or upload a new version.',
};

export { STATE_NOTES };
