/* @layer store-site @kind constants */
/** The Publish form's fixed choices: the three modes, the licences offered and the pack files it takes. */
import type { SelectOption } from '@ds/primitives/Select';
import { CONTAINERS } from '@shared/store/containers';

/** A new item, the next version of one, or a change to its listing. */
type PublishMode = 'new' | 'version' | 'listing';

const LICENSE_OPTIONS: SelectOption[] = [
  { value: 'CC-BY-4.0', label: 'CC-BY-4.0', description: 'Anyone may share and change it, crediting you.' },
  { value: 'CC-BY-SA-4.0', label: 'CC-BY-SA-4.0', description: 'The same, and changes keep this licence.' },
  { value: 'CC-BY-NC-4.0', label: 'CC-BY-NC-4.0', description: 'Credit you, and never sold.' },
  { value: 'CC0-1.0', label: 'CC0-1.0', description: 'No rights kept.' },
  { value: 'All rights reserved', label: 'All rights reserved', description: 'Players may install it, nothing more.' },
];

const DEFAULT_LICENSE = 'CC-BY-4.0';

/** What the pack drop zone takes: one file of a store container. */
const PACK_ACCEPT: string[] = CONTAINERS.map((container) => `.${container}`);

const PAGE_TITLES: Record<PublishMode, (name: string) => string> = {
  new: () => 'Publish a new item',
  version: (name) => `New version of ${name}`,
  listing: (name) => `Edit ${name}`,
};

const SUBMIT_LABELS: Record<PublishMode, string> = {
  new: 'Upload and submit for review',
  version: 'Upload and submit for review',
  listing: 'Submit for review',
};

export { LICENSE_OPTIONS, DEFAULT_LICENSE, PACK_ACCEPT, PAGE_TITLES, SUBMIT_LABELS };
export type { PublishMode };
