/* @layer renderer-lib @kind logic */
// Graphics-stack probe. Prefers WebGL2 so the limits match the game canvas, and unmasks the real
// adapter string through the debug-renderer extension.
import type { WebglDiagnostics } from './types';

type AnyGl = WebGLRenderingContext | WebGL2RenderingContext;

const createContext = (): { gl: AnyGl; version: 1 | 2 } | null => {
  const canvas = document.createElement('canvas');
  const gl2 = canvas.getContext('webgl2');
  if (gl2) return { gl: gl2, version: 2 };
  const gl1 = canvas.getContext('webgl');
  return gl1 ? { gl: gl1, version: 1 } : null;
};

const unmasked = (gl: AnyGl, masked: number, unmaskedName: 'UNMASKED_VENDOR_WEBGL' | 'UNMASKED_RENDERER_WEBGL'): string => {
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  const value = ext ? gl.getParameter(ext[unmaskedName]) : null;
  return String(value ?? gl.getParameter(masked) ?? '-');
};

const probeWebgl = (): WebglDiagnostics | null => {
  try {
    const context = createContext();
    if (!context) return null;
    const { gl, version } = context;
    const attributes = gl.getContextAttributes();
    const viewport = gl.getParameter(gl.MAX_VIEWPORT_DIMS) as Int32Array | null;
    const info: WebglDiagnostics = {
      version,
      vendor: unmasked(gl, gl.VENDOR, 'UNMASKED_VENDOR_WEBGL'),
      renderer: unmasked(gl, gl.RENDERER, 'UNMASKED_RENDERER_WEBGL'),
      glVersion: String(gl.getParameter(gl.VERSION) ?? '-'),
      shadingLanguage: String(gl.getParameter(gl.SHADING_LANGUAGE_VERSION) ?? '-'),
      maxTextureSize: Number(gl.getParameter(gl.MAX_TEXTURE_SIZE) ?? 0),
      maxViewport: viewport ? `${viewport[0]}x${viewport[1]}` : '-',
      maxRenderBufferSize: Number(gl.getParameter(gl.MAX_RENDERBUFFER_SIZE) ?? 0),
      antialias: attributes?.antialias === true,
      failIfMajorPerformanceCaveat: attributes?.failIfMajorPerformanceCaveat === true,
    };
    // Browsers cap live WebGL contexts and the game canvas needs one, so release the probe now.
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return info;
  } catch {
    return null;
  }
};

export { probeWebgl };
