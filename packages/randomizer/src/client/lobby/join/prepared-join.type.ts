/* @layer bridge-wasm @kind types */
import type { SlotEntry, UploadKind, WorldEntry } from '@drizztdourden08/archipelia-lobby-protocol';

type PreparedFile = { sha256: string; kind: UploadKind; bytes: Uint8Array; size: number };

type PreparedJoin = {
  worlds: WorldEntry[];
  slots: SlotEntry[];
  files: Map<string, PreparedFile>;
};

export type { PreparedFile, PreparedJoin };
