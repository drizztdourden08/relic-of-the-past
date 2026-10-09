/* @layer tests @kind helper */
import { unpackPackedBytes } from '@rotp/asset-extraction';
import type { FakeModule } from '../ap-fake-module';

const SESSION_FILE = '/session_dialogue.bin';

const sessionChunks = (fake: FakeModule): Uint8Array[] => {
  const blob = fake.files.get(SESSION_FILE);
  return blob === undefined ? [] : unpackPackedBytes(unpackPackedBytes(blob)[1]);
};

export { sessionChunks };
