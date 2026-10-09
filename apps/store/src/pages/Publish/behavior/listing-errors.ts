/* @layer store-site @kind logic */
import { MAX_TAGS } from '@shared/hub/schemas/common';
import { FIELD_LABELS, FIELD_MESSAGES } from '../Publish.constants';
import type { FieldErrors } from '../Publish.type';
import { compactErrors } from './compact-errors';
import { LISTING_CAPS, TAG_SCHEMA } from './listing-errors.constants';
import type { ListingText } from './useListingFields.type';

const tooLong = (label: string, value: string, cap: number) => {
  const length = value.trim().length;
  return length > cap ? `Keep the ${label.toLowerCase()} to ${cap} characters. It has ${length}.` : null;
};

const required = (value: string, missing: string, label: string, cap: number) =>
  (value.trim() === '' ? missing : tooLong(label, value, cap));

const tagError = (tags: readonly string[]) => {
  if (tags.length > MAX_TAGS) return `Keep to ${MAX_TAGS} tags. Remove ${tags.length - MAX_TAGS}.`;
  const bad = tags.find((tag) => !TAG_SCHEMA.safeParse(tag).success);
  if (bad === undefined) return null;
  if (bad.length > LISTING_CAPS.tag) return `"${bad}" is too long. Keep a tag to ${LISTING_CAPS.tag} characters.`;
  return `"${bad}": use lowercase letters, digits, dots and dashes.`;
};

const listingErrors = (text: ListingText): FieldErrors => compactErrors({
  name: required(text.name, FIELD_MESSAGES.nameMissing, FIELD_LABELS.name, LISTING_CAPS.name),
  summary: required(text.summary, FIELD_MESSAGES.summaryMissing, FIELD_LABELS.summary, LISTING_CAPS.summary),
  description: tooLong(FIELD_LABELS.description, text.description, LISTING_CAPS.description),
  tags: tagError(text.tags),
  license: required(text.license, FIELD_MESSAGES.licenseMissing, FIELD_LABELS.license, LISTING_CAPS.license),
});

export { listingErrors };
