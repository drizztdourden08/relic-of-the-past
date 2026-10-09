/* @layer store-api @kind constants */
import type { FirstEntryFailure } from '../../../../shared/store/manifest/read-first-entry';

const FIRST_ENTRY_REFUSALS: Record<FirstEntryFailure, string> = {
  'not-zip': 'The upload is not a ZIP archive.',
  truncated: 'The manifest entry is larger than the first megabyte of the pack.',
  encrypted: 'The pack is encrypted.',
  streamed: 'The first entry records its size after its data; export the pack from the app.',
  method: 'The manifest entry uses a compression the store does not read.',
  'too-large': 'The manifest is too large.',
  inflate: 'The manifest entry is damaged.',
  json: 'The manifest is not valid JSON.',
};

export { FIRST_ENTRY_REFUSALS };
