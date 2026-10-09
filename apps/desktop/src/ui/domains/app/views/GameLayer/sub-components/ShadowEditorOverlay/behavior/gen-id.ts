/* @layer renderer-components @kind logic */
let nextId = 1;
const genId = (prefix: string): string => `${prefix}_${Date.now()}_${nextId++}`;

export { genId };
