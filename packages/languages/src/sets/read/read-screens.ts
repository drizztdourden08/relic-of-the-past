/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import type { ScreenPayload } from '@rotp/asset-extraction';
import { screensPath } from '../paths';
import { decodeScreens } from '../screens-codec';

const readScreens = async (files: FileStore, id: string): Promise<ScreenPayload | undefined> => {
  const text = await files.readText(screensPath(id));
  return text == null || text === '' ? undefined : decodeScreens(text);
};

export { readScreens };
