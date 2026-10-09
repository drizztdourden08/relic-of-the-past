/* @layer shared-asset-extraction @kind types */
interface GbaEntityHandlerRecord {
  type: number;
  thumbAddress: number;
}

interface GbaRoomTagHandlerRecord {
  tag: number;
  thumbAddress: number;
}

export type { GbaEntityHandlerRecord, GbaRoomTagHandlerRecord };
