/* @layer bridge-wasm @kind logic */
import type { FBO } from './gl-helpers.type';
import { createTexture } from './create-texture';

const createFBO = (gl: WebGLRenderingContext, width: number, height: number, filter: number = gl.LINEAR): FBO => {
  const texture = createTexture(gl, filter);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

  const framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  return { framebuffer, texture };
};

export { createFBO };
