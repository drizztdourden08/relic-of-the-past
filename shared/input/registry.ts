/**
 * Controller registry — self-registration pattern.
 * Each controller implementation imports this and calls registerController().
 * Consumers call findController() to get the implementation for a VID:PID.
 */

import type { BaseController } from './base';

const registry: BaseController[] = [];

/** Register a controller implementation. First match wins for VID:PID lookups. */
export function registerController(ctrl: BaseController): void {
  registry.push(ctrl);
}

/** Find a controller by VID:PID (hex strings, auto-pads to 4 chars). */
export function findController(vid: string, pid: string): BaseController | null {
  const v = vid.toLowerCase().padStart(4, '0');
  const p = pid.toLowerCase().padStart(4, '0');
  return registry.find(c => c.matches(v, p)) ?? null;
}

/** Find a controller by its unique ID. */
export function findControllerById(id: string): BaseController | null {
  return registry.find(c => c.id === id) ?? null;
}

/** Get all registered controllers (order = registration order). */
export function getAllControllers(): readonly BaseController[] {
  return registry;
}
