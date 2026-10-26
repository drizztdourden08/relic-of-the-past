/* @layer website-site @kind logic */
const pseudoRandom = (seed: number, salt: number): number => {
  const value = Math.sin(seed * 127.1 + salt * 311.7) * 43758.5453;
  return value - Math.floor(value);
};

export { pseudoRandom };
