/* @layer electron-main @kind logic */
const budgetedFrameCount = (totalBytes: number, frameCount: number, budget: number): number => {
  if (frameCount === 0 || totalBytes <= budget) return frameCount;
  const bytesPerFrame = totalBytes / frameCount;
  return Math.max(1, Math.floor(budget / bytesPerFrame));
};

export { budgetedFrameCount };
