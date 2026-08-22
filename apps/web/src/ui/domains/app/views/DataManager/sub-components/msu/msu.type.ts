/* @layer renderer-components @kind types */
import type { SoundChannel } from '@shared/types/msu-manifest';
import type { SelectOption } from '@ds/primitives/Select';

/** A pack carrying a `pack.json` is layered; one with only numbered audio files is classic. */
type PackFormat = 'layered' | 'classic';

interface MsuPack {
  name: string;
  fileCount: number;
  totalSize: number;
}

interface MsuPackRow extends MsuPack {
  format: PackFormat;
}

interface MsuFile {
  name: string;
  size: number;
}

interface TrackInfo {
  fileName: string;
  trackNum: number;
  ext: string;
}

interface MatchedTrack {
  trackNum: number;
  description: string;
  fileName: string | null;
  /** How many layers the manifest gives this slot; 0 for a slot the manifest does not cover. */
  layerCount: number;
}

/** The outcome of one storage-touching action, phrased for the panel's status line. */
interface ActionResult {
  success: boolean;
  message: string;
}

interface MsuManagerProps {
  onDeleteConfirm: (title: string, message: string, onConfirm: () => void) => void;
  onRefresh: () => void;
}

interface TrackRowProps {
  trackNum: number;
  description: string;
  fileName: string | null;
  fileSize?: number;
  layerCount: number;
  options: SelectOption[];
  playing: boolean;
  busy: boolean;
  expanded: boolean;
  /** True while the sound chip's own version of this slot is the one sounding. */
  playingOriginal: boolean;
  onAssign: (trackNum: number, fileName: string) => void;
  onPreview: (trackNum: number) => void;
  onStopPreview: () => void;
  onPlayOriginal: (trackNum: number) => void;
  onToggleLayers: (trackNum: number) => void;
}

/**
 * One row in a sound channel's list: the catalogue entry crossed with what the pack authors.
 *
 * `label` is present for only the ids whose purpose is unambiguous, so `triggers` — the game's
 * own function names — is the description for every other row.
 */
interface SoundRowData {
  soundId: number;
  /** The id as the studio shows it, e.g. `0x0C`. */
  hex: string;
  label: string | null;
  triggers: string[];
  /** How many places raise it — a rough measure of how often it is heard. */
  sites: number;
  /** 0 while the pack leaves this sound to the sound chip. */
  layerCount: number;
  /** True for an id this pack claims that the catalogue does not list. */
  unlisted: boolean;
}

interface SoundRowProps {
  row: SoundRowData;
  channel: SoundChannel;
  /** True while this sound is the one the preview session belongs to. */
  playing: boolean;
  /** On an effects channel every press adds a sound, so play never becomes stop. */
  additive: boolean;
  busy: boolean;
  expanded: boolean;
  /** True while the sound chip's own version of this sound is the one sounding. */
  playingOriginal: boolean;
  /** Null while the channel is still being scanned; false once known to make no sound. */
  chipAudible: boolean | null;
  onPreview: (channel: SoundChannel, soundId: number) => void;
  onStopPreview: () => void;
  onPlayOriginal: (soundId: number) => void;
  onToggleLayers: (soundId: number) => void;
  onStopReplacing: (soundId: number) => void;
}

const getTrackNumber = (filename: string): number | null => {
  const match = filename.match(/(\d+)\.(pcm|opuz)$/i);
  return match ? parseInt(match[1], 10) : null;
};

export { getTrackNumber };
export type {
  PackFormat, MsuPack, MsuPackRow, MsuFile, TrackInfo, MatchedTrack, ActionResult,
  MsuManagerProps, TrackRowProps, SoundRowData, SoundRowProps,
};
