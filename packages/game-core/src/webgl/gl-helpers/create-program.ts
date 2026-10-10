/* @layer bridge-wasm @kind logic */
import { createShader } from './create-shader';

const createProgram = (gl: WebGLRenderingContext, vertSrc: string, fragSrc: string, label = '[WebGL]'): WebGLProgram | null => {
  const vert = createShader(gl, gl.VERTEX_SHADER, vertSrc, label);
  const frag = createShader(gl, gl.FRAGMENT_SHADER, fragSrc, label);
  if (!vert || !frag) return null;

  const program = gl.createProgram() as WebGLProgram | null;
  if (!program) return null;
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(`${label} Program link error:`, gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  gl.detachShader(program, vert);
  gl.detachShader(program, frag);
  gl.deleteShader(vert);
  gl.deleteShader(frag);
  return program;
};

export { createProgram };
