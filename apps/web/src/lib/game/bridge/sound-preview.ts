/* @layer bridge-wasm @kind logic */
/**
 * Renders what the sound chip would play for one sound id, for auditioning the original next to a
 * replacement.
 *
 * The core does this on a private second chip (emscripten_sound_preview.c), so nothing here can
 * disturb the music actually playing or the state a save would capture. It needs a core holding
 * parsed assets but no game in progress at all — see preview-core, which supplies the running
 * game's module when there is one and boots an idle core when there is not.
 */
import type { SoundChannel } from '@shared/types/msu-manifest';
import { previewModuleNow } from '../preview-core';

/**
 * What a preview can be asked for: the three sound channels, plus music. Music is not a
 * SoundChannel — nothing claims music per id, it is handed over whole — but it is written to a port
 * like the rest, so rendering it is the same operation.
 */
type PreviewTarget = SoundChannel | 'music';

/** APU port per target, matching SOUND_CHANNEL_PORTS in the sound catalogue. */
const PREVIEW_PORT: Record<PreviewTarget, number> = { music: 0, ambient: 1, sfx1: 2, sfx2: 3 };

/** The chip runs at one frame per video frame; this is how the core counts a duration. */
const FRAMES_PER_SECOND = 60;

interface RenderedSound {
  /** Interleaved stereo, 16-bit signed — a copy, safe to keep. */
  samples: Int16Array;
  sampleRate: number;
  /** Which song bank answered. Only interesting for diagnosing a silent id. */
  bank: number;
}

/** Whether a resolved core has its assets parsed, and so can render an original right now. */
const canPreviewOriginals = (): boolean => {
  const mod = previewModuleNow();
  if (mod === null) return false;
  try {
    return mod.ccall('WasmSoundPreviewReady', 'number', [], []) === 1;
  } catch {
    return false;
  }
};

/**
 * Render `seconds` of the chip playing `soundId` on `target`. Returns null when the core cannot
 * do it, and a buffer of digital silence when the id simply has no sound on the chip — those are
 * different answers and the caller reports them differently.
 */
const renderOriginalSound = (
  target: PreviewTarget,
  soundId: number,
  seconds: number,
): RenderedSound | null => {
  const mod = previewModuleNow();
  if (mod === null) return null;
  try {
    const frames = Math.max(1, Math.round(seconds * FRAMES_PER_SECOND));
    // -1 = let the core find the bank holding this sound. Music ids are spread across banks (the
    // overworld songs in the base one, the dungeon songs in the bank layered over it), and sound
    // effects are in the base bank, so the search answers both without a table here.
    const sampleFrames = mod.ccall(
      'WasmRenderSoundPreview', 'number',
      ['number', 'number', 'number', 'number'],
      [PREVIEW_PORT[target], soundId, -1, frames],
    ) as number;
    if (sampleFrames <= 0) return null;

    const ptr = mod.ccall('WasmSoundPreviewBuffer', 'number', [], []) as number;
    if (!ptr) return null;

    // Copy out: the core reuses this buffer for the next render, and a growing heap can detach
    // the view entirely.
    const view = new Int16Array(mod.HEAPU8.buffer, ptr, sampleFrames * 2);
    return {
      samples: new Int16Array(view),
      sampleRate: mod.ccall('WasmSoundPreviewRate', 'number', [], []) as number,
      bank: mod.ccall('WasmSoundPreviewBank', 'number', [], []) as number,
    };
  } catch {
    return null;
  }
};

export { canPreviewOriginals, renderOriginalSound };
export type { PreviewTarget, RenderedSound };
