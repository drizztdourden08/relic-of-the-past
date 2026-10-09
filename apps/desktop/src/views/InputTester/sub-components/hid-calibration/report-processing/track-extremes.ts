/* @layer renderer-components @kind logic */
const trackExtremes = (bytes: Uint8Array, mins: Uint8Array, maxs: Uint8Array): void => {
  bytes.forEach((value, i) => {
    const min = mins[i];
    const max = maxs[i];
    if (min !== undefined && value < min) mins[i] = value;
    if (max !== undefined && value > max) maxs[i] = value;
  });
};

export { trackExtremes };
