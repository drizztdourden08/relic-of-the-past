/* @layer shared-game @kind logic */
import { CONTAINER_VERSION, HDR_BYTES, HDR_SNAPSHOT_OFFSET } from './state-file.constants';

const readSnapshotBytes = (buffer: ArrayBuffer): number | null => {
  if (buffer.byteLength < HDR_BYTES) return null;
  const view = new DataView(buffer);
  if (view.getUint32(0, true) !== CONTAINER_VERSION) return null;
  return view.getUint32(HDR_SNAPSHOT_OFFSET, true);
};

export { readSnapshotBytes };
