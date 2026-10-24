/* @layer bridge-wasm @kind logic */
import { BASE64_SLICE } from '../lobby.constants';

const bytesToBase64 = (bytes: Uint8Array): string => {
  let binary = '';
  for (let start = 0; start < bytes.length; start += BASE64_SLICE) {
    binary += String.fromCharCode(...bytes.subarray(start, start + BASE64_SLICE));
  }
  return btoa(binary);
};

export { bytesToBase64 };
