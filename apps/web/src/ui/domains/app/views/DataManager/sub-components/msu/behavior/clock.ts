/* @layer renderer-components @kind logic */
/** m:ss, the one spelling for every position or length in the studio. */

const clock = (seconds: number): string => {
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
};

export { clock };
