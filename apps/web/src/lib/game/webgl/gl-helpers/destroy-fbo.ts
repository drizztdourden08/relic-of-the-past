/* @layer bridge-wasm @kind logic */
import type { FBO } from './gl-helpers.type';

const destroyFBO = (gl: WebGLRenderingContext, fbo: FBO): void => {
  gl.deleteFramebuffer(fbo.framebuffer);
  gl.deleteTexture(fbo.texture);
};

export { destroyFBO };
