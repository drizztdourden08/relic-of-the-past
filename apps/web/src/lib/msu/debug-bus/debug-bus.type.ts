/* @layer renderer-lib @kind types */
interface MsuRollEvent {
  kind: 'roll';
  channel: string;
  programId: number;
  layerId: string;
  layerName: string;
  chance: number;
  passed: boolean;
}

type MsuDebugEvent = MsuRollEvent;
type MsuDebugListener = (event: MsuDebugEvent) => void;

export type { MsuDebugEvent, MsuDebugListener, MsuRollEvent };
