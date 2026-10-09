/* @layer electron-main @kind logic */
import { createHash } from 'crypto';
import { createReadStream } from 'fs';

const sha256File = async (filePath: string): Promise<string> => {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(filePath)) hash.update(chunk as Buffer);
  return hash.digest('hex');
};

export { sha256File };
