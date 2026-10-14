/* @layer renderer-components @kind logic */
const nonEmpty = (value: string): string | undefined => (value === '' ? undefined : value);

export { nonEmpty };
