/* @layer tests @kind helper */
import { unpackPackedBytes } from '@rotp/asset-extraction';
import type { FakeModule } from '../ap-fake-module';
import { required } from '../../required';

const SESSION_FILE = '/session_dialogue.bin';

const sessionChunks = (fake: FakeModule): Uint8Array[] => {
  const blob = fake.files.get(SESSION_FILE);
  return blob === undefined ? [] : unpackPackedBytes(required(unpackPackedBytes(blob)[1], 'session line chunks'));
};

export { sessionChunks };
