/* @layer renderer-components @kind logic */
const classesOf = (...names: (string | false | undefined)[]): string => names.filter(Boolean).join(' ');

export { classesOf };
