/* @layer renderer-components @kind logic */
const extensionOf = (fileName: string): string => {
  const dot = fileName.lastIndexOf('.');
  const ext = dot > 0 ? fileName.slice(dot + 1).toLowerCase() : '';
  return ext.length > 0 ? ext : 'pcm';
};

export { extensionOf };
