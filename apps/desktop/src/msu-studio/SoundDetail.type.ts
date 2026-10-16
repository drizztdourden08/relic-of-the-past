/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';
import type { MsuPackManifest, SoundChannel } from '@rotp/game-data';
import type { MsuFile, SoundPanelController, SoundRowData } from './msu.type';

interface SoundDetailProps {
  pack: string;
  channel: SoundChannel;
  row: SoundRowData;
  sound: SoundPanelController;
  manifest: MsuPackManifest;
  saveBase: MsuPackManifest;
  files: MsuFile[];
  isLayered: boolean;
  readOnly: boolean;
  onPreview: (channel: SoundChannel, soundId: number) => void;
  onPlayOriginal: (channel: SoundChannel, soundId: number) => void;
  onStopReplacing: (channel: SoundChannel, soundId: number) => void;
  onClose: (channel: SoundChannel) => void;
  onConfirm: (title: string, message: string, onConfirm: () => void) => void;
  onReload: () => void;
}

type OpenSound = Pick<SoundDetailProps, 'channel' | 'row' | 'sound'>;

type SoundSideProps = Omit<SoundDetailProps, 'channel' | 'row' | 'sound'> & {
  open: OpenSound | null;
  noteTitle: string;
  note: string;
  packPanel: ReactNode;
};

export type { SoundDetailProps, SoundSideProps };
