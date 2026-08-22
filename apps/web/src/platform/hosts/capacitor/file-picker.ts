/* @layer renderer-other @kind logic */
/**
 * Capacitor file picker via @capawesome/capacitor-file-picker (reads bytes as base64).
 *
 * Saving goes to the device's Documents directory rather than through a share sheet: this
 * project does not depend on @capacitor/share, and a file written where the user's own file
 * manager can reach it needs no extra plugin.
 */
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { Filesystem, Directory } from '@capacitor/filesystem';
import type { FilePickerPort } from '@shared/platform';

const bytesToBase64 = (bytes: Uint8Array): string => {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
};

const base64ToBytes = (b64: string): Uint8Array => {
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i);
  return out;
};

// Map picker extensions to MIME types Android's document picker accepts
// (.sfc/.smc have no registered type, so they resolve to application/octet-stream).
const extToMime = (ext: string): string => (ext === 'zip' ? 'application/zip' : 'application/octet-stream');

const createCapacitorFilePicker = (): FilePickerPort => ({
  pickFile: async (opts) => {
    const types = opts?.extensions?.length ? [...new Set(opts.extensions.map(extToMime))] : undefined;
    const result = await FilePicker.pickFiles(types ? { readData: true, types } : { readData: true });
    const file = result.files[0];
    return file?.data ? { name: file.name, bytes: base64ToBytes(file.data) } : null;
  },
  saveFile: async ({ name, bytes }) => {
    try {
      await Filesystem.writeFile({
        path: name,
        directory: Directory.Documents,
        data: bytesToBase64(bytes),
        recursive: true,
      });
      return { saved: true, name };
    } catch (err) {
      return { saved: false, error: err instanceof Error ? err.message : String(err) };
    }
  },
});

export { createCapacitorFilePicker };
