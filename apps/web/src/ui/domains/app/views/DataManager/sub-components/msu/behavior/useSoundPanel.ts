/* @layer renderer-components @kind hook */
import { useCallback, useState } from 'react';
import type { SoundChannel } from '@shared/types/msu-manifest';
import { writeMsuManifest } from '@app/lib/storage/msu-store';
import { useAudibleIds } from './useAudibleIds';
import { useOriginalPreview } from './useOriginalPreview';
import { useSoundPreview } from './useSoundPreview';
import { useSoundRows } from './useSoundRows';
import { useSoundUpload } from './useSoundUpload';
import { withoutSound } from './sound-manifest';
import { failure } from './failure';
import { soundTitle } from '../sound-labels';
import type { ActionResult } from '../msu.type';
import type { SoundPanelParams } from './useSoundPanel.type';

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
