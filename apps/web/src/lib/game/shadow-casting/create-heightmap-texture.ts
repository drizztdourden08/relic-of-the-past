/* @layer bridge-wasm @kind logic */
import { createTexture } from '../webgl/gl-helpers';

const createHeightmapTexture = (gl: WebGLRenderingContext, width: number, height: number): WebGLTexture => {
  const texture = createTexture(gl, gl.LINEAR);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, width, height, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, new Uint8Array(width * height));
  return texture;
};

export { createHeightmapTexture };
