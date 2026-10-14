/* @layer renderer-components @kind logic */
const emptyFilesMessage = (fileCount: number, supersededOnly: boolean, filter: string): string => {
  if (fileCount === 0) return 'This pack has no audio yet. Drop some in above';
  if (supersededOnly) return 'No superseded original matches this filter';
  return `No file matches "${filter}"`;
};

export { emptyFilesMessage };
