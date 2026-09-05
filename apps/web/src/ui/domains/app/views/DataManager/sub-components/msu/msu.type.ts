/* @layer renderer-components @kind types */
import type { MsuPackManifest, SoundChannel } from '@shared/types/msu-manifest';
import { trackNumberOf } from '@shared/storage/msu-paths';
import type { AmbientRole } from '@shared/game/data/ambient-reach';
import type { SelectOption } from '@ds/primitives/Select';
import type { useSoundPanel } from './behavior/useSoundPanel';

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

/** Everything the effects tab hands straight through to each of its channel sections. */
interface MsuEffectsPanelProps {
  pack: string;
  /** What the rows and the editors SHOW. */
  manifest: MsuPackManifest;
  /** What a save WRITES into. */
  saveBase: MsuPackManifest;
  files: MsuFile[];
  isLayered: boolean;
  onDeleteConfirm: (title: string, message: string, onConfirm: () => void) => void;
  onReload: () => void;
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

/** One row in a sound channel's list. `label` exists only for unambiguous ids; `triggers` describes the rest. */
interface SoundRowData {
  soundId: number;
  /** The id as the studio shows it, e.g. `0x0C`. */
  hex: string;
  label: string | null;
  triggers: string[];
  /** How many places raise it. Roughly, how often it is heard. */
  sites: number;
  /** 0 while the pack leaves this sound to the sound chip. */
  layerCount: number;
  /** True for an id this pack claims that the catalogue does not list. */
  unlisted: boolean;
  /** What the id does on the ambient channel; null on the effects channels, which have no roles. */
  role: AmbientRole | null;
  /** True for an id nothing in the game can raise, so it is only shown on request. */
  unreachable: boolean;
}

interface SoundRowProps {
  row: SoundRowData;
  channel: SoundChannel;
  /** Tags the row with its channel. Set wherever one list holds more than one; the channels do not share id spaces. */
  showChannel?: boolean;
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

/** One channel's wiring, handed around whole. A list showing two channels keeps one each and picks by row. */
type SoundPanelController = ReturnType<typeof useSoundPanel>;

interface SoundListItemProps {
  pack: string;
  channel: SoundChannel;
  row: SoundRowData;
  /** The controller for THIS row's channel, not for the list. */
  sound: SoundPanelController;
  manifest: MsuPackManifest;
  saveBase: MsuPackManifest;
  availableFiles: string[];
  isLayered: boolean;
  /** Tags the row with its channel. Set wherever one list holds more than one. */
  showChannel?: boolean;
  onPreview: (channel: SoundChannel, soundId: number) => void;
  onPlayOriginal: (channel: SoundChannel, soundId: number) => void;
  onToggleLayers: (channel: SoundChannel, soundId: number) => void;
  onStopReplacing: (soundId: number) => void;
  onConfirm: (title: string, message: string, onConfirm: () => void) => void;
  onReload: () => void;
}

/** Re-exported from shared so the studio and the pack loader can never disagree on this. */
const getTrackNumber = (filename: string): number | null => trackNumberOf(filename);

export { getTrackNumber };
export type {
  PackFormat, MsuPack, MsuPackRow, MsuFile, TrackInfo, MatchedTrack, ActionResult,
  MsuManagerProps, MsuEffectsPanelProps, TrackRowProps, SoundRowData, SoundRowProps,
  SoundPanelController, SoundListItemProps,
};
