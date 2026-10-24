/* @layer shared-types @kind types */
import type { ControllerInvokeContract } from './controller-contract';
import type { MsuInvokeContract } from './msu-contract';
import type { FfmpegInvokeContract } from './ffmpeg-contract.type';
import type { SanctuaryInvokeContract } from './sanctuary-contract.type';
import type { HubInvokeContract } from './hub-contract.type';
import type { StoreInvokeContract } from './store-contract.type';
import type { LanInvokeContract } from './lan-contract.type';
import type { DevToolsInvokeContract } from './invoke/dev-tools-invoke-contract.type';
import type { ScreenEditorInvokeContract } from './invoke/screen-editor-invoke-contract.type';

interface InvokeContract extends
  DevToolsInvokeContract, ScreenEditorInvokeContract, ControllerInvokeContract, MsuInvokeContract,
  FfmpegInvokeContract, SanctuaryInvokeContract, HubInvokeContract, StoreInvokeContract, LanInvokeContract {}

export type { InvokeContract };
