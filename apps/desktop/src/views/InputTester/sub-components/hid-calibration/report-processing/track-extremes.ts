/* @layer renderer-components @kind logic */
const trackExtremes = (bytes: Uint8Array, mins: Uint8Array, maxs: Uint8Array): void => {
  for (let i = 0; i < bytes.length; i++) {
    if (bytes[i] < mins[i]) mins[i] = bytes[i];
    if (bytes[i] > maxs[i]) maxs[i] = bytes[i];
  }
};

export { trackExtremes };
