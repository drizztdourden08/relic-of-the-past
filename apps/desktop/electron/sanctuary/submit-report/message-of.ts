/* @layer electron-main @kind logic */
const messageOf = (err: unknown, fallback: string): string =>
  (err instanceof Error && err.message.length > 0 ? err.message : fallback);

export { messageOf };
