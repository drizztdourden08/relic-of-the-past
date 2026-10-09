/* @layer electron-main @kind logic */
const stackOf = (value: unknown): string => {
  if (value instanceof Error) return value.stack ?? `${value.name}: ${value.message}`;
  return String(value);
};

export { stackOf };
