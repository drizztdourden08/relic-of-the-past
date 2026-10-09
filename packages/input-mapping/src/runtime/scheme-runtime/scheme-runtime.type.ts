/* @layer renderer-lib @kind types */
import type { ControlSchemeId } from '@rotp/features';
import type { FunctionMask } from '../../scheme/function-mask/function-mask.type';
import type { PauseEvent } from '@rotp/game-data';
import type { CoreBindings, ModernBindings, ModernScheme } from '@rotp/game-data';

interface MenuSink {
  open: boolean;
  push: (events: PauseEvent[]) => void;
}

interface SchemeRuntime {
  scheme: ControlSchemeId;
  bindings: ModernBindings | null;
  core: CoreBindings | null;
  assignments: ModernScheme;
  mapOnSelect: boolean;
  menuSink: MenuSink;
  prev: FunctionMask;
  reseedPrev: boolean;
}

type SchemeBindingsListener = (bindings: ModernBindings | null) => void;

export type { MenuSink, SchemeBindingsListener, SchemeRuntime };
