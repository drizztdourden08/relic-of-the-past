/* @layer electron-main @kind logic */
const stemOf = (name: string): string => name.replace(/\.[^.]*$/, '');

export { stemOf };
