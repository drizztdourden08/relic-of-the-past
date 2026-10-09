/* @layer renderer-lib @kind logic */
import { computeBitmask } from '@rotp/input-mapping';
import { buildInputSample, edgeBaseline, schemeRuntime } from '@rotp/input-mapping';
import { menuEdges, menuShadowedSlots, readFunctionMask, remapForScheme } from '@rotp/input-mapping';
import { ownsHudItem } from './item-ownership';
import { setActiveItem } from '@rotp/game-core';
import type { SchemeRuntime } from '@rotp/input-mapping';
import type { InputSample } from '@rotp/input-mapping';
import type { ModernBindings } from '@rotp/game-data';
import type { InputManager } from '@app/input/input-manager/input-manager';
import { KEEP_EQUIPPED_ITEM, NEUTRAL_MASK, NO_FUNCTIONS, NO_SHADOW, NO_SLOTS } from '@rotp/input-mapping';

const classicMask = (m: InputManager): number =>
  computeBitmask(m.keyStates, m.keyboardMap, m.gamepadButtonMap, m.gamepadAxisMap, m.hidStates, m.allowed);

const sampleOf = (m: InputManager): InputSample =>
  buildInputSample(m.allPressedKeys, m.hidStates, m.allowed);

const modernActive = (runtime: SchemeRuntime): boolean =>
  runtime.scheme === 'modern' && runtime.bindings !== null;

const readLens = (runtime: SchemeRuntime): ModernBindings | null => {
  if (modernActive(runtime) && runtime.bindings) return runtime.bindings;
  const core = runtime.core ?? runtime.bindings?.core ?? null;
  return core ? { core, slots: NO_SLOTS } : null;
};

const routeToMenu = (m: InputManager, runtime: SchemeRuntime): void => {
  const lens = readLens(runtime);
  const pressed = lens ? readFunctionMask(sampleOf(m), lens) : NO_FUNCTIONS;
  const shadowed = lens ? menuShadowedSlots(lens) : NO_SHADOW;
  runtime.menuSink.push(menuEdges(pressed, edgeBaseline(pressed), shadowed));
  m.setInputFn?.(NEUTRAL_MASK);
  runtime.prev = pressed;
};

const routeModern = (m: InputManager, runtime: SchemeRuntime, bindings: NonNullable<SchemeRuntime['bindings']>): void => {
  const pressed = readFunctionMask(sampleOf(m), bindings);
  const { mask, activeItem } = remapForScheme({
    scheme: 'modern',
    classicMask: 0,
    pressed,
    assignments: runtime.assignments,
    mapOnSelect: runtime.mapOnSelect,
    ownsItem: ownsHudItem,
  });
  if (activeItem !== KEEP_EQUIPPED_ITEM) setActiveItem(activeItem);
  m.setInputFn?.(mask);
  runtime.prev = pressed;
};

const routeClassic = (m: InputManager, runtime: SchemeRuntime): void => {
  const { mask } = remapForScheme({
    scheme: 'classic',
    classicMask: classicMask(m),
    pressed: NO_FUNCTIONS,
    assignments: runtime.assignments,
    mapOnSelect: runtime.mapOnSelect,
    ownsItem: ownsHudItem,
  });
  m.setInputFn?.(mask);
};

const routeInputFrame = (m: InputManager): void => {
  const runtime = schemeRuntime;
  if (runtime.menuSink.open) {
    routeToMenu(m, runtime);
    return;
  }
  const bindings = runtime.bindings;
  if (modernActive(runtime) && bindings) routeModern(m, runtime, bindings);
  else routeClassic(m, runtime);
};

export { routeInputFrame };
