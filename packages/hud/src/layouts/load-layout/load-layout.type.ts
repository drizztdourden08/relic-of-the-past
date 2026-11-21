/* @layer shared-hud @kind types */
import type { ReflowWarning } from '../validate-motion-warnings';
import type { HudLayout } from '../../types/hud-layout';

interface LoadFailure { ok: false; errors: string[] }
interface LoadSuccess { ok: true; doc: HudLayout; warnings: ReflowWarning[] }
type LoadResult = LoadSuccess | LoadFailure;

export type { LoadResult };
