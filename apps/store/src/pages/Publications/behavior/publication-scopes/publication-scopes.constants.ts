/* @layer store-site @kind constants */
const PUBLICATION_SCOPES = [
  { id: 'all', label: 'All' },
  { id: 'ready', label: 'Ready' },
  { id: 'waiting', label: 'Waiting' },
  { id: 'published', label: 'Published' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'drafts', label: 'Drafts' },
] as const;

export { PUBLICATION_SCOPES };
