/* @layer renderer-lib @kind logic */
const seededNoise = (seed: number, salt: number): number => {
  const v = Math.sin(seed * 127.1 + salt * 311.7) * 43758.5453;
  return v - Math.floor(v);
};

export { seededNoise };
