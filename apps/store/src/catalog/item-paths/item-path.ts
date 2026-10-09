/* @layer store-site @kind logic */
const itemPath = (item: { id: string }): string => `/items/${encodeURIComponent(item.id)}`;

export { itemPath };
