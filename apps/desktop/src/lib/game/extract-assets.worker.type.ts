/* @layer bridge-wasm @kind types */
import type { SetBakeInput } from '@shared/game/language';
import type { SpriteDef } from '@rotp/asset-extraction';
import type { AssetSourceId } from '@rotp/asset-extraction';

type SupplementRoms = Partial<Record<AssetSourceId, Uint8Array>>;

type ExtractRequest =
  | { op: 'assets'; romBytes: Uint8Array; supplementRoms?: SupplementRoms; languages: SetBakeInput[] }
  | { op: 'language'; romBytes: Uint8Array; code: string }
  | { op: 'sprites'; romBytes: Uint8Array; defs: SpriteDef[] }
  | { op: 'menu-text'; romBytes: Uint8Array };

interface AssetsResult {
  base: Uint8Array;
  sidecars: { id: AssetSourceId; bytes: Uint8Array }[];
  failures: { id: AssetSourceId; reason: string }[];
}

interface WorkerScope {
  onmessage: ((e: MessageEvent<ExtractRequest>) => void) | null;
  postMessage: (msg: unknown) => void;
}

export type { SupplementRoms, ExtractRequest, AssetsResult, WorkerScope };
