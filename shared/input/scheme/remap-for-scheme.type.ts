/* @layer shared-input @kind types */
import type { FunctionMask } from './function-mask';
import type { OwnsItem } from './remap-modern.type';
import type { ModernScheme } from '../../types/controls/scheme';
import type { ControlSchemeId, RemapResult } from './remap.type';

interface RemapRequest {
  scheme: ControlSchemeId;
  classicMask: number;
  pressed: FunctionMask;
  assignments: ModernScheme;
  mapOnSelect: boolean;
  ownsItem: OwnsItem;
}

type RemapStrategy = (request: RemapRequest) => RemapResult;

export type { RemapRequest, RemapStrategy };
