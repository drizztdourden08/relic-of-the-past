/* @layer bridge-wasm @kind types */
import type { SetBakeInput } from '@rotp/languages';
import type { SpriteDef } from '@rotp/asset-extraction';
import type { SupplementRoms } from '../storage/asset-files';

type ExtractRequest =
  | { op: 'assets'; romBytes: Uint8Array; supplementRoms?: SupplementRoms; languages: SetBakeInput[] }
  | { op: 'language'; romBytes: Uint8Array; code: string }
  | { op: 'sprites'; romBytes: Uint8Array; defs: SpriteDef[] }
  | { op: 'menu-text'; romBytes: Uint8Array };

type ExtractReply<T> =
  | { ok: true; result: T }
  | { ok: false; error: string }
  | { warn: string };

interface WorkerScope {
  onmessage: ((e: MessageEvent<ExtractRequest>) => void) | null;
  postMessage: (msg: unknown) => void;
}

export type { ExtractReply, ExtractRequest, WorkerScope };
