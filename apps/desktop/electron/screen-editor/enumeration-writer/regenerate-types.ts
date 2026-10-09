/* @layer electron-main @kind logic */
import { generateEnumTypes } from '../../../../../scripts/generate-enum-types.mjs';

const regenerateTypes = async (root: string): Promise<void> => {
  try {
    await generateEnumTypes(root);
  } catch (error) {
    console.error('enumeration-writer: failed to regenerate enumeration.type.ts', error);
  }
};

export { regenerateTypes };
