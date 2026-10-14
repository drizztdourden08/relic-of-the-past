/* @layer shared-hud @kind types */
import type { Rect } from '../../layouts/geometry.type';

interface PlaceEnv { opacity: number; dimmed: boolean }

interface PlaceFrame { box: Rect; unit: number }

export type { PlaceEnv, PlaceFrame };
