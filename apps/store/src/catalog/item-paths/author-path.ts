/* @layer store-site @kind logic */
const authorPath = (userId: string): string => `/authors/${encodeURIComponent(userId)}`;

export { authorPath };
