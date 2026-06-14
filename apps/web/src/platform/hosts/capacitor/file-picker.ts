/* @layer renderer-other @kind logic */
/** Capacitor file picker via @capawesome/capacitor-file-picker (reads bytes as base64). */
import { FilePicker } from '@capawesome/capacitor-file-picker';
import type { FilePickerPort } from '@shared/platform';

const base64ToBytes = (b64: string): Uint8Array => {
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i);
  return out;
};

const createCapacitorFilePicker = (): FilePickerPort => ({
  pickFile: async () => {
    const result = await FilePicker.pickFiles({ readData: true });
    const file = result.files[0];
    return file?.data ? { name: file.name, bytes: base64ToBytes(file.data) } : null;
  },
});

export { createCapacitorFilePicker };
