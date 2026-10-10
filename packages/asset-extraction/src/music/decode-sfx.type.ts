/* @layer shared-asset-extraction @kind types */
type SfxLine =
  | { kind: 'fallthrough' }
  | { kind: 'restart' }
  | { kind: 'effect'; effectName: string }
  | {
    kind: 'note';
    note: string | null;
    effectName?: string;
    noteLength: number | null;
    volumeLeft: number | null;
    volumeRight: number | null;
  };

interface SfxPrefix {
  command: number;
  noteLength: number | null;
  volumeLeft: number | null;
  volumeRight: number | null;
  next: number;
}

interface DecodedSfxCommand {
  line: SfxLine;
  next: number;
  end: boolean;
}

export type { DecodedSfxCommand, SfxLine, SfxPrefix };
