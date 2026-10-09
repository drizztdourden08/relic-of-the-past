/* @layer store-site @kind constants */
import type { FirstEntryFailure } from '@shared/store/manifest/read-first-entry';

const FAILURES: Record<FirstEntryFailure, string> = {
  'not-zip': 'The pack is not a zip archive.',
  truncated: 'The manifest does not fit in the head of the pack.',
  encrypted: 'The manifest is encrypted.',
  streamed: 'The pack keeps its sizes after the data, so the manifest cannot be read from its head.',
  method: 'The manifest is packed in a way the store does not read.',
  'too-large': 'The manifest is larger than the store allows.',
  inflate: 'The manifest could not be unpacked.',
  json: 'The manifest is not valid JSON.',
};

export { FAILURES };
