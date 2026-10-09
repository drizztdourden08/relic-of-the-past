/* @layer renderer-app @kind logic */
import { resolveRecordLabel } from './record-links';

const optionLabel = (id: string): string => {
  const name = resolveRecordLabel(id);
  return name === id ? id : name;
};

export { optionLabel };
