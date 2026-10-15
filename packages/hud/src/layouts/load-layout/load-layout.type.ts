/* @layer shared-hud @kind types */
import type { HudLayout } from '../../types/hud-layout';

interface LoadFailure { ok: false; errors: string[] }
interface LoadSuccess { ok: true; doc: HudLayout; warnings: string[] }
type LoadResult = LoadSuccess | LoadFailure;

export type { LoadResult };
