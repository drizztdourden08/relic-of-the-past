/* @layer shared-input @kind types */
import type { FunctionMask } from './function-mask';
import type { OwnsItem } from './remap-modern.type';
import type { ModernScheme } from '@rotp/game-data';
import type { ControlSchemeId, RemapResult } from '@rotp/features';

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
