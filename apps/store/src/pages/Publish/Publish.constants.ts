/* @layer store-site @kind constants */
import type { SelectOption } from '@ds/primitives/Select';
import { CONTAINERS } from '@shared/store/containers';
import { LICENSES } from '@shared/store/licenses';
import type { PublishMode } from './Publish.type';

const LICENSE_OPTIONS: SelectOption[] = LICENSES.map(({ id, label, description }) => ({ value: id, label, description }));

const DEFAULT_LICENSE = 'CC-BY-4.0';

const PACK_ACCEPT: string[] = CONTAINERS.map((container) => `.${container}`);

const PAGE_TITLES: Record<PublishMode, (name: string) => string> = {
  new: () => 'Publish a new item',
  version: (name) => `New version of ${name}`,
  listing: (name) => `Edit ${name}`,
};

const SUBMIT_LABELS: Record<PublishMode, string> = {
  new: 'Upload',
  version: 'Upload',
  listing: 'Submit for review',
};

const FIELD_LABELS = {
  name: 'Name',
  summary: 'Short description',
  description: 'Description',
  tags: 'Tags',
  license: 'Licence',
  color: 'Colour',
} as const;

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

export { LICENSE_OPTIONS, DEFAULT_LICENSE, PACK_ACCEPT, PAGE_TITLES, SUBMIT_LABELS, FIELD_LABELS, FIELD_MESSAGES };
