/* @layer bridge-wasm @kind types */
import type { getModule } from '../wasm-bridge';

type ScriptedGrantSurface =
  | { surface: 'capacity'; kind: 0 | 1 }
  | { surface: 'pond'; prize: number }
  | { surface: 'wish-pond'; pond: number; rung: number }
  | { surface: 'bat' }
  | { surface: 'minigame'; roomId: number };

type SingleArmSurface = Exclude<ScriptedGrantSurface, { surface: 'wish-pond' }>;

type LiveModule = NonNullable<ReturnType<typeof getModule>>;

export type { ScriptedGrantSurface, SingleArmSurface, LiveModule };
