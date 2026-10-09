/* @layer renderer-components @kind logic */
const stemOf = (fileName: string): string => {
  const dot = fileName.lastIndexOf('.');
  return dot > 0 ? fileName.slice(0, dot) : fileName;
};

export { stemOf };
