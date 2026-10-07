/* @layer store-site @kind logic */
/** The site paths of an item and an author, spelled in one place. */
const itemPath = (item: { id: string }): string => `/items/${encodeURIComponent(item.id)}`;

const authorPath = (userId: string): string => `/authors/${encodeURIComponent(userId)}`;

export { itemPath, authorPath };
