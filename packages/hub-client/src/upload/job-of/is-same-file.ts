/* @layer site-kit @kind logic */
import type { FileFacts } from '../upload-record.type';

const isSameFile = (facts: FileFacts, file: File) =>
  facts.name === file.name && facts.size === file.size && facts.lastModified === file.lastModified;

export { isSameFile };
