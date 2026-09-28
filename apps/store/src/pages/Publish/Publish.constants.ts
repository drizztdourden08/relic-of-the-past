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

/** A new pack only uploads; sending it for review is a later step. */
const SUBMIT_LABELS: Record<PublishMode, string> = {
  new: 'Upload',
  version: 'Upload',
  listing: 'Submit for review',
};

/** The listing fields' labels, also named in their error messages. */
const FIELD_LABELS = {
  name: 'Name',
  summary: 'Short description',
  description: 'Description',
  tags: 'Tags',
  license: 'Licence',
  color: 'Colour',
} as const;

/** Each message says what is wrong and how to fix it. */
const FIELD_MESSAGES = {
  packMissing: 'Add the pack file. Drop it here, or click to pick it.',
  nameMissing: 'Give the pack a name. It shows on every card.',
  summaryMissing: 'Write a short description. It shows on cards.',
  licenseMissing: 'Pick a licence, so players know what they may do with it.',
  cardMissing: 'Add a card picture. It shows on every shelf.',
  rights: 'Tick the box to confirm you may share it.',
  inFlight: 'A version of this pack is still uploading, ready or in review. Send, withdraw or delete it from Publications first.',
  nothingChanged: 'Nothing has changed yet. Change a field or a picture first.',
  following: 'Filled from the short description until you change it.',
} as const;

/** The red line over the form once Submit is pressed with fields still wrong. */
const needsALook = (count: number) => (count === 1
  ? '1 field needs a look. It is outlined in red below.'
  : `${count} fields need a look. They are outlined in red below.`);

export { LICENSE_OPTIONS, DEFAULT_LICENSE, PACK_ACCEPT, PAGE_TITLES, SUBMIT_LABELS, FIELD_LABELS, FIELD_MESSAGES, needsALook };
export type { PublishMode };
