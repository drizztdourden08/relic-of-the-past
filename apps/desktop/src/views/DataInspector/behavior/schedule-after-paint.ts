/* @layer renderer-app @kind logic */
const scheduleAfterPaint = (task: () => void): (() => void) => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const frame = requestAnimationFrame(() => {
    timer = setTimeout(task, 0);
  });
  return () => {
    cancelAnimationFrame(frame);
    if (timer !== undefined) clearTimeout(timer);
  };
};

export { scheduleAfterPaint };
