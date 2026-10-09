/* @layer electron-main @kind logic */
import { readFile, writeFile } from 'fs/promises';
import { handle } from '../lib/ipc/handle';
import { resolveSourceFile } from './resolve-source-file';
import { insertBeforeArrayClose, replaceById } from './source-writers';
import { registerConnectionPairHandler } from './connection-pair-writer';
import { allocateGeography } from './geography-writer';
import { allocateTag, deleteTag, writeTag } from './tag-writer';
import { allocateItemGroup, deleteItemGroup, writeItemGroup } from './item-group-writer';
import { allocateEnumeration, deleteEnumeration, writeEnumeration } from './enumeration-writer';
import { registerRecordHandlers } from './record-handlers';
import { guard } from './guard';
import { refusal } from './refusal';
import { getWorkspaceRoot } from './workspace-root';
import { writeConnections } from './write-connections';
import { writeScreen } from './write-screen';

const registerScreenAndConnectionHandlers = (): void => {
  handle('screenEditor:writeScreen', async (_e, args) => {
    try {
      return await writeScreen(args);
    } catch (e: unknown) {
      return refusal(e);
    }
  });

  handle('screenEditor:writeConnections', async (_e, args) => {
    try {
      return await writeConnections(args);
    } catch (e: unknown) {
      return refusal(e);
    }
  });
};

const registerCheckTextHandler = (): void => {
  handle('screenEditor:writeCheck', async (_e, args) => {
    try {
      const path = resolveSourceFile(getWorkspaceRoot(), args.filePath, 'checks');
      const content = await readFile(path, 'utf-8');
      const result = args.checkId
        ? replaceById(content, args.checkId, args.code)
        : insertBeforeArrayClose(content, args.code);
      if (result.error) return { success: false, error: result.error };
      await writeFile(path, result.content, 'utf-8');
      return { success: true };
    } catch (e: unknown) {
      return refusal(e);
    }
  });
};

const registerVocabularyHandlers = (): void => {
  handle('screenEditor:allocateGeography', async (_e, args) => guard(allocateGeography, args));
  handle('screenEditor:allocateTag', async (_e, args) => guard(allocateTag, args));
  handle('screenEditor:writeTag', async (_e, args) => guard(writeTag, args));
  handle('screenEditor:deleteTag', async (_e, args) => guard(deleteTag, args));
  handle('screenEditor:allocateItemGroup', async (_e, args) => guard(allocateItemGroup, args));
  handle('screenEditor:writeItemGroup', async (_e, args) => guard(writeItemGroup, args));
  handle('screenEditor:deleteItemGroup', async (_e, args) => guard(deleteItemGroup, args));
  handle('screenEditor:allocateEnumeration', async (_e, args) => guard(allocateEnumeration, args));
  handle('screenEditor:writeEnumeration', async (_e, args) => guard(writeEnumeration, args));
  handle('screenEditor:deleteEnumeration', async (_e, args) => guard(deleteEnumeration, args));
};

const registerScreenEditorHandlers = (): void => {
  registerRecordHandlers();
  registerConnectionPairHandler();
  registerScreenAndConnectionHandlers();
  registerCheckTextHandler();
  registerVocabularyHandlers();
};

export { registerScreenEditorHandlers };
