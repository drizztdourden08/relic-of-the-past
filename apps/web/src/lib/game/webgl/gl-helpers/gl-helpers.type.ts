/* @layer bridge-wasm @kind types */
interface FBO {
  framebuffer: WebGLFramebuffer;
  texture: WebGLTexture;
}

interface DrawQuadOptions {
  mode?: number;
  count?: number;
}

export type { FBO, DrawQuadOptions };
