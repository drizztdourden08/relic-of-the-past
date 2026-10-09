/* @layer shared-types @kind types */
import type { ControllerInvokeContract } from './controller-contract';
import type { LanguageInvokeContract } from './language-contract.type';
import type { MsuInvokeContract } from './msu-contract';
import type { FfmpegInvokeContract } from './ffmpeg-contract.type';
import type { SanctuaryInvokeContract } from './sanctuary-contract.type';
import type { HubInvokeContract } from './hub-contract.type';
import type { StoreInvokeContract } from './store-contract.type';
import type { DevToolsInvokeContract } from './invoke/dev-tools-invoke-contract.type';
import type { HostInvokeContract } from './invoke/host-invoke-contract.type';
import type { ProfileDataInvokeContract } from './invoke/profile-data-invoke-contract.type';
import type { ScreenEditorInvokeContract } from './invoke/screen-editor-invoke-contract.type';
import type { UpdaterInvokeContract } from './invoke/updater-invoke-contract.type';

interface InvokeContract extends
  HostInvokeContract, ProfileDataInvokeContract, DevToolsInvokeContract, ScreenEditorInvokeContract, UpdaterInvokeContract,
  ControllerInvokeContract, LanguageInvokeContract, MsuInvokeContract, FfmpegInvokeContract,
  SanctuaryInvokeContract, HubInvokeContract, StoreInvokeContract {}

export type { InvokeContract };
