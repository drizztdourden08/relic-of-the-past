/* @layer renderer-components @kind logic */
const stringifyOrEmpty = (value: object | null): string => (value ? JSON.stringify(value, null, 2) : '');

export { stringifyOrEmpty };
