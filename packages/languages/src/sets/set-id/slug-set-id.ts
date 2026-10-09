/* @layer shared-storage @kind logic */
const slugSetId = (value: string): string =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'imported';

export { slugSetId };
