/* @layer bridge-wasm @kind logic */
import { previewModuleNow } from '../../preview-core/preview-module-now';
import { FIND_BANK_FOR_SOUND, FRAMES_PER_SECOND, PREVIEW_PORT, STEREO_CHANNELS } from './sound-preview.constants';
import type { PreviewTarget, RenderedSound } from './sound-preview.type';

const renderOriginalSound = (
  target: PreviewTarget,
  soundId: number,
  seconds: number,
): RenderedSound | null => {
  const mod = previewModuleNow();
  if (mod === null) return null;
  try {
    const frames = Math.max(1, Math.round(seconds * FRAMES_PER_SECOND));
    const sampleFrames = mod.ccall(
      'WasmRenderSoundPreview', 'number',
      ['number', 'number', 'number', 'number'],
      [PREVIEW_PORT[target], soundId, FIND_BANK_FOR_SOUND, frames],
    );
    if (sampleFrames <= 0) return null;

    const ptr = mod.ccall('WasmSoundPreviewBuffer', 'number', [], []);
    if (!ptr) return null;

    const view = new Int16Array(mod.HEAPU8.buffer, ptr, sampleFrames * STEREO_CHANNELS);
    const independentCopy = new Int16Array(view);
    return {
      samples: independentCopy,
      sampleRate: mod.ccall('WasmSoundPreviewRate', 'number', [], []),
      bank: mod.ccall('WasmSoundPreviewBank', 'number', [], []),
    };
  } catch {
    return null;
  }
};

export { renderOriginalSound };
