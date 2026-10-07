/* @layer renderer-components @kind hook */
/**
 * One sound channel's tab, wired. The filter and unreachable toggle are owned by the list, so two
 * channels shown as one list search as one. "Replace" only opens the editor: an empty claim would
 * silence the chip's version, so the editor's save writes the claim. Un-claiming is a real write.
 */
import { useCallback, useState } from 'react';
import type { MsuPackManifest, SoundChannel } from '@shared/types/msu-manifest';
import { writeMsuManifest } from '@app/lib/storage/msu-store';
import { useAudibleIds } from './useAudibleIds';
import { useOriginalPreview } from './useOriginalPreview';
import { useSoundPreview } from './useSoundPreview';
import { useSoundRows } from './useSoundRows';
import { useSoundUpload } from './useSoundUpload';
import { withoutSound } from './sound-manifest';
import { failure } from './usePackList';
import { soundTitle } from '../sound-labels';
import type { ActionResult, MsuFile } from '../msu.type';

interface SoundPanelParams {
  pack: string;
  channel: SoundChannel;
  /** The query this channel's rows are narrowed by. Owned by the list, so several can share one. */
  filter: string;
  /** Whether to include the ids nothing in the game raises. Shared for the same reason. */
  showUnreachable: boolean;
  /** What the rows and the editor SHOW. */
  manifest: MsuPackManifest;
  /** What a write goes into, which is the pack's own manifest when it has one. */
  saveBase: MsuPackManifest;
  files: MsuFile[];
  reload: () => void;
}

const useSoundPanel = (params: SoundPanelParams) => {
  const { pack, channel, manifest, saveBase, files, filter, showUnreachable, reload } = params;
  const [openSound, setOpenSound] = useState<number | null>(null);
  const [status, setStatus] = useState<ActionResult | null>(null);

  const {
    rows, ids, replacedCount, raisedCount, reachableCount, unreachableCount, total, hiddenCount,
  } = useSoundRows(manifest, channel, filter, showUnreachable);
  const { audible } = useAudibleIds(channel, ids);
  const { playing, previewError, play: playPack, stop: stopPack, reportStore } = useSoundPreview(pack, manifest);
  const original = useOriginalPreview(channel);
  const { upload, uploading } = useSoundUpload({ pack, files, reload });

  // One thing sounds at a time, so each start silences the other.
  const play = useCallback((soundChannel: SoundChannel, soundId: number) => {
    original.stop();
    void playPack(soundChannel, soundId);
  }, [original, playPack]);

  const stop = useCallback(() => {
    original.stop();
    stopPack();
  }, [original, stopPack]);

  const playOriginal = useCallback((soundId: number) => {
    stopPack();
    original.play(soundId);
  }, [original, stopPack]);

  const toggleLayers = useCallback((soundId: number) => {
    setOpenSound((open) => (open === soundId ? null : soundId));
  }, []);

  // For a list drawing on more than one channel: opening a row there has to shut the row open on
  // the other, or two editors sit open at once over one shared save.
  const closeLayers = useCallback(() => { setOpenSound(null); }, []);

  const stopReplacing = useCallback(async (soundId: number) => {
    try {
      await writeMsuManifest(pack, withoutSound(saveBase, channel, soundId));
      setStatus({ success: true, message: `${soundTitle(channel, soundId)} plays from the sound chip again` });
    } catch (err) {
      setStatus(failure(err, 'Could not update the pack'));
    } finally {
      reload();
    }
  }, [pack, channel, saveBase, reload]);

  const handleUpload = useCallback((dropped: File[]) => {
    void upload(dropped).then(setStatus);
  }, [upload]);

  return {
    rows, replacedCount, raisedCount, reachableCount, unreachableCount, total, hiddenCount,
    openSound, toggleLayers, closeLayers,
    playing, play, stop, reportStore,
    playingOriginal: original.playing,
    chipAudible: (soundId: number) => (audible === null ? null : audible.has(soundId)),
    playOriginal,
    uploading, handleUpload,
    stopReplacing,
    statusMessage: previewError ?? original.note ?? status?.message ?? null,
    statusOk: previewError === null && original.note === null && status?.success !== false,
  };
};

export { useSoundPanel };
export type { SoundPanelParams };
