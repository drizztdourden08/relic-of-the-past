/* @layer shared-game @kind logic */
const fibonacci = (n: number): number[] => {
  const sequence = [1, 1];
  let previous = 1;
  let current = 1;
  while (sequence.length < n) {
    [previous, current] = [current, previous + current];
    sequence.push(current);
  }
  return sequence.slice(0, n);
};

export { fibonacci };
