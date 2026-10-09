/* @layer renderer-lib @kind types */
type MsuImportPhase = 'download' | 'copy' | 'done' | 'error';

type MsuTrackEntry = { name: string; bytes: Uint8Array };

export type { MsuImportPhase, MsuTrackEntry };
