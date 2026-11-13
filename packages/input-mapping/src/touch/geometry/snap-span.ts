/* @layer shared-input @kind logic */

const snapSpan = (center: number, half: number, length: number, size: number): number => {
  const middle = length / 2;
  if (Math.abs(center - middle) <= size / 2) return middle;
  if (center < middle) return Math.round((center - half) / size) * size + half;
  const gap = length - (center + half);
  return length - Math.round(gap / size) * size - half;
};

export { snapSpan };
