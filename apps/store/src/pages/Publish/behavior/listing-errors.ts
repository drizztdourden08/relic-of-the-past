/* @layer store-site @kind logic */
/**
 * What is wrong with each listing field, in words that say how to fix it. The caps are read
 * from the schemas store-api parses a new item with, so the form and the API agree.
 */
import { MAX_TAGS, tagsSchema } from '@shared/hub/schemas/common';
import { itemCreateSchema } from '@shared/store/schemas';
import { FIELD_LABELS, FIELD_MESSAGES } from '../Publish.constants';
import type { FieldErrors } from '../Publish.type';
import { compactErrors } from './compact-errors';
import type { ListingText } from './useListingFields';

const { shape } = itemCreateSchema;
const TAG_SCHEMA = tagsSchema.innerType().element;

const LISTING_CAPS = {
  name: shape.name.maxLength ?? 0,
  summary: shape.summary.maxLength ?? 0,
  description: shape.description.removeDefault().maxLength ?? 0,
  license: shape.license.maxLength ?? 0,
  tag: TAG_SCHEMA.maxLength ?? 0,
};

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

export { listingErrors, LISTING_CAPS };
