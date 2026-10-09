/* @layer renderer-lib @kind types */
import type { OpusPacket } from '../opus-packets';

interface OpuzRange {
  packets: OpusPacket[];
  drop: number;
  samples: number;
}

interface OpuzAudio {
  ranges: OpuzRange[];
  loopRange: number | null;
  sampleRate: number;
  channels: number;
}

export type { OpuzAudio, OpuzRange };
