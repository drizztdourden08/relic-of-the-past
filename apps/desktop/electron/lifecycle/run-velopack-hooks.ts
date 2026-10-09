/* @layer electron-main @kind logic */
import { loadVelopack } from '../updater/velopack-loader';
import { registerDocumentAssociations, unregisterDocumentAssociations } from '../documents/document-associations';

const runVelopackHooks = (): void => {
  loadVelopack()?.VelopackApp.build()
    .onAfterInstallFastCallback(registerDocumentAssociations)
    .onAfterUpdateFastCallback(registerDocumentAssociations)
    .onBeforeUninstallFastCallback(unregisterDocumentAssociations)
    .run();
};

export { runVelopackHooks };
