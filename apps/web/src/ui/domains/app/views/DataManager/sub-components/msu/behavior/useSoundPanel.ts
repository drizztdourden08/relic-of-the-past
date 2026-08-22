/* @layer renderer-components @kind hook */
/**
 * One sound channel's tab, wired: the rows, the filter, which row is open, the audition, and
 * the one write that un-claims a sound.
 *
 * Claiming works the other way round on purpose. There is nothing to write until a sound has a
 * layer with audio in it — a manifest entry with an empty layer would claim the id, the core
 * would stop playing the chip's version, and the pack would answer with silence. So "replace"
 * only opens the editor, and the editor's own save is what writes the claim; un-claiming is a
 * real write, because there is something on disk to take back out.
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
  /** What the rows and the editor SHOW. */
  manifest: MsuPackManifest;
  /** What a write goes into — the pack's own manifest when it has one. */
  saveBase: MsuPackManifest;
  files: MsuFile[];
  reload: () => void;
}

const useSoundPanel = (params: SoundPanelParams) => {
  const { pack, channel, manifest, saveBase, files, reload } = params;
  const [filter, setFilter] = useState('');
  const [openSound, setOpenSound] = useState<number | null>(null);
  const [status, setStatus] = useState<ActionResult | null>(null);

  const { rows, ids, replacedCount, raisedCount, total } = useSoundRows(manifest, channel, filter);
  const { audible } = useAudibleIds(channel, ids);
  const { playing, previewError, play: playPack, stop: stopPack, reportStore } = useSoundPreview(pack, manifest);
  const original = useOriginalPreview(channel);
  const { upload, uploading } = useSoundUpload({ pack, files, reload });

  // One thing sounds at a time, so each start silences the other. Comparing a replacement with the
  // original means hearing them one after the other, not on top of each other.
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
    rows, replacedCount, raisedCount, total,
    filter, setFilter,
    openSound, toggleLayers,
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
