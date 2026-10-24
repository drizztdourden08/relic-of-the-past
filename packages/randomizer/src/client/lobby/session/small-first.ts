/* @layer bridge-wasm @kind logic */
import type { UploadProgress } from './lobby-state.type';

const smallFirst = (uploads: UploadProgress[]): UploadProgress[] => [
  ...uploads.filter((upload) => upload.kind === 'yaml'),
  ...uploads.filter((upload) => upload.kind !== 'yaml'),
];

export { smallFirst };
