/* @layer renderer-components @kind hook */
/**
 * One sound channel's tab, wired: the rows, the filter, which row is open, the audition, and
 * the one write that un-claims a sound.
 *
 * The filter and the unreachable toggle are NOT owned here. Two channels shown as one list have to
 * search as one list, so whoever renders the list holds the query and hands the same one to each
 * channel it draws from — a filter per channel would give one box that only searches half of what
 * is on screen.
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
  /** The query this channel's rows are narrowed by. Owned by the list, so several can share one. */
  filter: string;
  /** Whether to include the ids nothing in the game raises. Shared for the same reason. */
  showUnreachable: boolean;
  /** What the rows and the editor SHOW. */
  manifest: MsuPackManifest;
  /** What a write goes into — the pack's own manifest when it has one. */
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
