/* @layer renderer-app @kind logic */
import { resolveRecordLabel } from '@app/data-inspector/record-links';

const optionLabel = (id: string): string => {
  const name = resolveRecordLabel(id);
  return name === id ? id : name;
};

export { optionLabel };
