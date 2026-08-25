/* @layer renderer-components @kind logic */
/**
 * m:ss — how the studio reads any position or length inside a file.
 *
 * One spelling for all of them: a live playhead, a file's length and the point it repeats from are
 * the same kind of number, and reading two of them side by side in different formats is how a
 * comparison goes wrong.
 */

const clock = (seconds: number): string => {
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
};

export { clock };
