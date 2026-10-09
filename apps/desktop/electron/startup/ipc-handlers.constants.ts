/* @layer electron-main @kind constants */
import { registerWindowHandlers, registerAspectRatioHandlers } from '../window';
import { registerDisplayHandlers } from '../display/ipc-handlers';
import { registerDialogHandlers } from '../dialogs/ipc-handlers';
import { registerProfileHandlers } from '../profiles';
import { registerRomHandlers } from '../roms';
import { registerAssetHandlers } from '../assets/ipc-handlers';
import { registerSaveHandlers } from '../saves/ipc-handlers';
import { registerMsuHandlers } from '../msu/ipc-handlers';
import { registerMsuEditHandlers } from '../msu/edit-handlers';
import { registerMsuOptimizeHandlers } from '../msu/optimize-handlers';
import { registerMsuResumeHandlers } from '../msu/resume-handlers';
import { registerSpriteHandlers } from '../sprites/ipc-handlers';
import { registerLanguageHandlers } from '../languages/ipc-handlers';
import { registerSessionHandlers } from '../sessions/ipc-handlers';
import { registerTestHandlers } from '../test/ipc-handlers';
import { registerDumpLayersHandler } from '../debug/dump-layers-handler';
import { registerDumpNavHandler } from '../debug/dump-nav-handler';
import { registerSimRunHandler } from '../debug/sim-run-handler';
import { registerSimLogHandlers } from '../debug/sim-log-handler';
import { registerSessionLogHandler } from '../debug/session-log-handler';
import { registerConnectionHandlers } from '../connections/ipc-handlers';
import { registerScreenEditorHandlers } from '../screen-editor/ipc-handlers';
import { registerShadowCastingHandlers } from '../shadow-casting';
import { registerUiViewsHandlers } from '../ui-views';
import { registerRecommendationHandlers } from '../recommendations';
import { registerAppHandlers } from '../app/ipc-handlers';
import { registerDiagnosticsHandlers } from '../diagnostics/ipc-handlers';
import { registerWasmHandlers } from '../wasm/ipc-handlers';
import { registerStorageHandlers } from '../storage/ipc-handlers';
import { registerFileHandlers } from '../storage/file-handlers';
import { registerUpdaterHandlers } from '../updater';
import { registerSanctuaryHandlers } from '../sanctuary/ipc-handlers';
import { registerHubHandlers } from '../hub/ipc-handlers';
import { registerDebugReportHandlers } from '../diagnostics/debug-report/ipc-handlers';
import { registerFfmpegHandlers } from '../tools/ipc-handlers';
import { registerStoreHandlers } from '../store/ipc-handlers';

const IPC_HANDLERS: Array<{ register: () => void; devOnly?: boolean }> = [
  { register: registerWindowHandlers },
  { register: registerAspectRatioHandlers },
  { register: registerDisplayHandlers },
  { register: registerDialogHandlers },
  { register: registerProfileHandlers },
  { register: registerRomHandlers },
  { register: registerAssetHandlers },
  { register: registerSaveHandlers },
  { register: registerMsuHandlers },
  { register: registerMsuEditHandlers },
  { register: registerMsuOptimizeHandlers },
  { register: registerMsuResumeHandlers },
  { register: registerSpriteHandlers },
  { register: registerLanguageHandlers },
  { register: registerSessionHandlers },
  { register: registerTestHandlers },
  { register: registerDumpLayersHandler },
  { register: registerDumpNavHandler },
  { register: registerSimRunHandler },
  { register: registerSimLogHandlers },
  { register: registerSessionLogHandler },
  { register: registerConnectionHandlers },
  { register: registerUiViewsHandlers },
  { register: registerRecommendationHandlers },
  { register: registerScreenEditorHandlers, devOnly: true },
  { register: registerShadowCastingHandlers },
  { register: registerUpdaterHandlers },
  { register: registerAppHandlers },
  { register: registerDiagnosticsHandlers },
  { register: registerWasmHandlers },
  { register: registerStorageHandlers },
  { register: registerFileHandlers },
  { register: registerHubHandlers },
  { register: registerSanctuaryHandlers },
  { register: registerDebugReportHandlers },
  { register: registerFfmpegHandlers },
  { register: registerStoreHandlers },
];

export { IPC_HANDLERS };
