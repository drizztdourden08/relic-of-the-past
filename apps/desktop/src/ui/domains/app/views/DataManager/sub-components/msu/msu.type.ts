/* @layer renderer-components @kind types */
import type { MsuPackManifest, SoundChannel } from '@rotp/game-data';
import type { AmbientRole } from '@rotp/game-data';
import type { SelectOption } from '@drizztdourden08/tessera/primitives';
import type { useSoundPanel } from './behavior/useSoundPanel';

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
  layerCount: number;
}

interface ActionResult {
  success: boolean;
  message: string;
}

interface MsuManagerProps {
  onDeleteConfirm: (title: string, message: string, onConfirm: () => void) => void;
  onRefresh: () => void;
}

interface MsuEffectsPanelProps {
  pack: string;
  manifest: MsuPackManifest;
  saveBase: MsuPackManifest;
  files: MsuFile[];
  isLayered: boolean;
  readOnly: boolean;
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
  playingOriginal: boolean;
  readOnly: boolean;
  onAssign: (trackNum: number, fileName: string) => void;
  onPreview: (trackNum: number) => void;
  onStopPreview: () => void;
  onPlayOriginal: (trackNum: number) => void;
  onToggleLayers: (trackNum: number) => void;
}

interface SoundRowData {
  soundId: number;
  hex: string;
  label: string | null;
  triggers: string[];
  sites: number;
  layerCount: number;
  unlisted: boolean;
  role: AmbientRole | null;
  unreachable: boolean;
}

interface SoundRowProps {
  row: SoundRowData;
  channel: SoundChannel;
  showChannel?: boolean;
  playing: boolean;
  additive: boolean;
  busy: boolean;
  expanded: boolean;
  playingOriginal: boolean;
  chipAudible: boolean | null;
  readOnly: boolean;
  onPreview: (channel: SoundChannel, soundId: number) => void;
  onStopPreview: () => void;
  onPlayOriginal: (soundId: number) => void;
  onToggleLayers: (soundId: number) => void;
  onStopReplacing: (soundId: number) => void;
}

type SoundPanelController = ReturnType<typeof useSoundPanel>;

interface SoundListItemProps {
  pack: string;
  channel: SoundChannel;
  row: SoundRowData;
  sound: SoundPanelController;
  manifest: MsuPackManifest;
  saveBase: MsuPackManifest;
  availableFiles: string[];
  isLayered: boolean;
  showChannel?: boolean;
  readOnly: boolean;
  onPreview: (channel: SoundChannel, soundId: number) => void;
  onPlayOriginal: (channel: SoundChannel, soundId: number) => void;
  onToggleLayers: (channel: SoundChannel, soundId: number) => void;
  onStopReplacing: (soundId: number) => void;
  onConfirm: (title: string, message: string, onConfirm: () => void) => void;
  onReload: () => void;
}

export type {
  PackFormat, MsuPack, MsuPackRow, MsuFile, TrackInfo, MatchedTrack, ActionResult,
  MsuManagerProps, MsuEffectsPanelProps, TrackRowProps, SoundRowData, SoundRowProps,
  SoundPanelController, SoundListItemProps,
};
