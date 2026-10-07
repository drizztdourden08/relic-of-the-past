/* @layer renderer-components @kind types */
import type { MsuPackManifest } from '@shared/types/msu-manifest';
import type { Audition } from '../../behavior/file-audition';

/** One slot the pack fills: a music track or a replaced sound. */
type SlotRow = {
  key: string;
  /** `#12` for a track, `0x05` for a sound. */
  number: string;
  /** The slot's name, or `Track N` when the name dataset has none. */
  title: string;
  layerCount: number;
  /** Every file the slot's layers play, in layer order, without repeats. */
  files: string[];
};

type PackSummaryLine = {
  tracks: number;
  sounds: number;
  files: number;
  deluxe: boolean;
};

type TrackListProps = {
  manifest: MsuPackManifest;
  /** The file sounding, or null. */
  playing: string | null;
  /** The file being read and decoded, before it sounds. */
  loading: string | null;
  /** The handle on the sounding file, for its player. */
  audition: Audition | null;
  /** Why a file did not play (too large to preview, unreadable), by file name. */
  notes: ReadonlyMap<string, string>;
  /** Plays a file, or stops it when it is the one sounding. */
  onPlay: (fileName: string) => void;
  className?: string;
};

export type { SlotRow, PackSummaryLine, TrackListProps };
