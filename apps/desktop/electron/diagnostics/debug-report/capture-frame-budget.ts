/* @layer electron-main @kind logic */
/** Pure frame-selection math for downsampling a capture session to fit a byte budget - shared
 *  between the video path (budget against the encoded video's own size) and the no-ffmpeg
 *  fallback (budget against raw PNG bytes). See finalize-capture-session.ts. */

const frameName = (index: number): string => `frame_${String(index + 1).padStart(4, '0')}.png`;

/** Frames picked at even intervals across the whole sequence, so downsampling thins detail
 *  out evenly instead of cutting the end (or the start) off entirely. */
const pickEvenlySpread = <T,>(items: T[], count: number): T[] => {
  if (count >= items.length) return items;
  if (count <= 0) return [];
  const stride = items.length / count;
  return Array.from({ length: count }, (_, i) => items[Math.floor(i * stride)]);
};

/** How many of `frameCount` frames (each contributing ~totalBytes/frameCount) fit under
 *  `budget`, assuming size scales roughly linearly with frame count. Already-under-budget
 *  returns every frame unchanged. */
const budgetedFrameCount = (totalBytes: number, frameCount: number, budget: number): number => {
  if (frameCount === 0 || totalBytes <= budget) return frameCount;
  const bytesPerFrame = totalBytes / frameCount;
  return Math.max(1, Math.floor(budget / bytesPerFrame));
};

export { frameName, pickEvenlySpread, budgetedFrameCount };
