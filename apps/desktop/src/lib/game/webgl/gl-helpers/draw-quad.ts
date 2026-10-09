/* @layer bridge-wasm @kind logic */
import type { DrawQuadOptions } from './gl-helpers.type';

const drawQuad = (gl: WebGLRenderingContext, program: WebGLProgram, buffer: WebGLBuffer, options: DrawQuadOptions = {}): void => {
  const { mode = gl.TRIANGLE_STRIP, count = 4 } = options;
  const posLoc = gl.getAttribLocation(program, 'a_position');
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
  gl.drawArrays(mode, 0, count);
};

export { drawQuad };
