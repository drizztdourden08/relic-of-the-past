/* @layer renderer-components @kind logic */
const stringOf = (value: unknown): string => (typeof value === 'string' ? value : '');

export { stringOf };
