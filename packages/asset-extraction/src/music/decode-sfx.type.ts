/* @layer shared-asset-extraction @kind types */
interface SfxLine {
  kind: 'note' | 'effect' | 'restart' | 'fallthrough';
  effectName?: string;
  note?: string | null;
  noteLength?: number | null;
  volumeLeft?: number | null;
  volumeRight?: number | null;
}

export type { SfxLine };
