/* @layer shared-storage @kind logic */
const extensionOf = (name: string): string => (name.split('.').pop() ?? '').toLowerCase();

export { extensionOf };
