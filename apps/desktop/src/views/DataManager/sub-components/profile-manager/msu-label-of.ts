/* @layer renderer-components @kind logic */
const msuLabelOf = (msuPack: string | null | undefined): string => {
  if (msuPack === null || msuPack === undefined || msuPack === '') return 'None';
  return msuPack;
};

export { msuLabelOf };
