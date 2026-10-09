/* @layer renderer-components @kind logic */
const popcount = (n: number) => {
  let c = 0;
  let v = n;
  while (v) { c += v & 1; v >>>= 1; }
  return c;
};

export { popcount };
