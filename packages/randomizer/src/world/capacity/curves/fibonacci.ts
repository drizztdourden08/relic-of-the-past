/* @layer shared-game @kind logic */
const fibonacci = (n: number): number[] => {
  const sequence = [1, 1];
  while (sequence.length < n) {
    sequence.push(sequence[sequence.length - 1] + sequence[sequence.length - 2]);
  }
  return sequence.slice(0, n);
};

export { fibonacci };
