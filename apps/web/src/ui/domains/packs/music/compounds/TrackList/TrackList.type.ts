/* @layer renderer-components @kind types */
import type { MsuPackManifest, MsuSoundDef, SoundChannel } from '@shared/types/msu-manifest';
import type { Audition } from '../../behavior/file-audition';

type SlotRow = {
  key: string;
  number: string;
  title: string;
  layerCount: number;
  files: string[];
};

type PackSummaryLine = {
  tracks: number;
  sounds: number;
  files: number;
  deluxe: boolean;
};

type ChannelSound = { channel: SoundChannel; sound: MsuSoundDef };

type TrackListProps = {
  manifest: MsuPackManifest;
  playing: string | null;
  loading: string | null;
  audition: Audition | null;
  notes: ReadonlyMap<string, string>;
  onPlay: (fileName: string) => void;
  className?: string;
};

type SlotFileProps = {
  name: string;
  playing: boolean;
  loading: boolean;
  audition: Audition | null;
  note?: string;
  onPlay: (fileName: string) => void;
};

type SlotRowViewProps = {
  row: SlotRow;
  playing: string | null;
  loading: string | null;
  audition: Audition | null;
  notes: ReadonlyMap<string, string>;
  onPlay: (fileName: string) => void;
};

type SlotSectionProps = {
  title: string;
  rows: SlotRow[];
  playing: string | null;
  loading: string | null;
  audition: Audition | null;
  notes: ReadonlyMap<string, string>;
  onPlay: (fileName: string) => void;
};

export type { ChannelSound, PackSummaryLine, SlotFileProps, SlotRow, SlotRowViewProps, SlotSectionProps, TrackListProps };
