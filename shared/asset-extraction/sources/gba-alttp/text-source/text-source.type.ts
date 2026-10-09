/* @layer shared-asset-extraction @kind types */
interface GbaAlttpTextMessage {
  id: number;
  address: number;
  bytes: Buffer;
  plainText: string;
}

export type { GbaAlttpTextMessage };
