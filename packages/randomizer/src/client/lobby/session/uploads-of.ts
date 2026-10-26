/* @layer bridge-wasm @kind logic */
import type { PreparedJoin } from '../join/prepared-join.type';
import type { UploadProgress } from './lobby-state.type';

const uploadsOf = (prepared: PreparedJoin, need: string[]): UploadProgress[] =>
  need.flatMap((sha256) => {
    const file = prepared.files.get(sha256);
    return file === undefined ? [] : [{ sha256, kind: file.kind, size: file.size, sent: 0, done: false }];
  });

export { uploadsOf };
