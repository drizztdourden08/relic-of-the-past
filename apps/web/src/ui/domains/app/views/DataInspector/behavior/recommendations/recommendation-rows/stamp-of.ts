/* @layer renderer-app @kind logic */
const stampOf = (at: number): string => new Date(at).toISOString().slice(0, 16).replace('T', ' ');

export { stampOf };
