/* @layer bridge-wasm @kind types */
import type { ApVersion } from '../ap-protocol.type';

interface ConnectParams {
  game: string;
  slotName: string;
  uuid: string;
  password?: string;
  version?: ApVersion;
  deathLink?: boolean;
}

export type { ConnectParams };
